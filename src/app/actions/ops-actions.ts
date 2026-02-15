"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RBAC } from "@/lib/auth/rbac";
import { HealthScoreEngine } from "@/lib/engines/health";
import {
  TicketPriority,
  TicketType,
  TicketCategory,
  TriageLevel,
} from "@prisma/client";

export type KanbanItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: string;
  category?: TicketCategory;
  triageLevel?: TriageLevel;
  huoltoNotes?: string | null;
  apartmentId?: string | null;
  stage:
    | "INBOX"
    | "ASSESSMENT"
    | "MARKETPLACE"
    | "EXECUTION"
    | "VERIFICATION"
    | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: "TICKET" | "OBSERVATION" | "PROJECT";
  date: Date;
  meta?: Record<string, unknown>; // Extra data for UI
};

export async function getOpsBoardItems(userId: string): Promise<KanbanItem[]> {
  // 0. RBAC Check
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== "BOARD_MEMBER" && user.role !== "ADMIN")) {
    throw new Error("Pääsy evätty.");
  }

  const items: KanbanItem[] = [];

  // 1. INBOX (Open Tickets, Not yet escalated to Expert)
  const tickets = await prisma.ticket.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      observationId: null,
      category: "MAINTENANCE",
    },
    orderBy: { createdAt: "desc" },
    include: { createdBy: true, apartment: true },
  });

  tickets.forEach((t) =>
    items.push({
      id: t.id,
      title: t.title,
      subtitle: t.createdBy.name || "Unknown",
      description: t.description,
      status: t.status,
      category: t.category,
      triageLevel: t.triageLevel,
      huoltoNotes: t.huoltoNotes,
      apartmentId: t.apartmentId,
      stage: "INBOX",
      priority: t.priority as KanbanItem["priority"],
      type: "TICKET",
      date: t.createdAt,
      meta: {
        hasLocation: !!t.apartment?.attributes,
        locationData: t.apartment?.attributes,
        isPublic: t.isPublic,
      },
    }),
  );

  // 2. ASSESSMENT (Observations or PROJECT Category Tickets)
  // Find Project-level tickets that need expert review
  const projectTickets = await prisma.ticket.findMany({
    where: {
      category: "PROJECT",
      status: "OPEN",
      observationId: null,
    },
    include: { createdBy: true },
  });

  projectTickets.forEach((t) =>
    items.push({
      id: t.id,
      title: t.title,
      subtitle: `Eskaloitu: ${t.createdBy.name || "Asukas"}`,
      status: t.status,
      category: t.category,
      stage: "ASSESSMENT",
      priority: t.priority as KanbanItem["priority"],
      type: "TICKET",
      date: t.createdAt,
    }),
  );

  const observations = await prisma.observation.findMany({
    where: { status: { in: ["OPEN", "REVIEWED"] } },
    include: { ticket: true },
  });

  observations.forEach((o) => {
    // If it has an assessment recommending action, it might be ready for Marketplace
    const hasVerdict = o.status === "REVIEWED";

    items.push({
      id: o.id,
      title: o.component,
      subtitle: hasVerdict ? "Asiantuntija arvioinut" : "Odottaa arviota",
      status: o.status,
      stage: hasVerdict ? "MARKETPLACE" : "ASSESSMENT",
      priority:
        o.severityGrade === 1
          ? "CRITICAL"
          : o.severityGrade === 2
            ? "HIGH"
            : "MEDIUM",
      type: "OBSERVATION",
      date: o.createdAt,
      meta: {
        verdict: o.technicalVerdict,
        hasLocation: !!o.location,
      },
    });
  });

  // 3. EXECUTION (Active Projects)
  const projects = await prisma.project.findMany({
    where: { status: { not: "COMPLETED" } },
    include: {
      observation: true,
      milestones: true,
      _count: {
        select: { bids: true },
      },
    },
  });

  projects.forEach((p) => {
    let stage: KanbanItem["stage"] = "EXECUTION";
    if (p.status === "TENDERING") stage = "MARKETPLACE";
    if (p.status === "WARRANTY") stage = "VERIFICATION";

    items.push({
      id: p.id,
      title: p.title,
      subtitle: `Tila: ${
        {
          PLANNED: "Suunnitteilla",
          TENDERING: "Kilpailutuksessa",
          PLANNING: "Suunnittelussa",
          EXECUTION: "Käynnissä",
          WARRANTY: "Takuuvaihe",
          COMPLETED: "Valmis",
          CONSTRUCTION: "Rakennusvaihe",
          DIAGNOSIS: "Kuntoarvio",
          ROI_ANALYSIS: "Analyysi",
          TECH_LEAD: "Suunnittelussa",
        }[p.status] || p.status
      }`,
      status: p.status,
      stage: stage,
      priority: "HIGH",
      type: "PROJECT",
      date: p.createdAt,
      meta: {
        bidCount: p._count.bids,
        hasLocation: !!p.observation?.location,
      },
    });
  });

  return items;
}

// TRANSITIONS

export async function janitorialCheckIn(
  ticketId: string,
  data: { notes: string; action: "RESOLVE" | "ESCALATE" },
) {
  try {
    if (data.action === "RESOLVE") {
      const ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: "CLOSED",
          huoltoNotes: data.notes,
          triageLevel: "ROUTINE",
        },
      });

      // Audit Log for resolution
      await RBAC.auditAccess(
        "system", // Replace with real session user in production
        "WRITE",
        `Ticket:${ticketId}`,
        `Vikailmoitus ratkaistu kohteessa ${ticket.unitIdentifier || "Yleiset tilat"}`,
      );
    } else {
      // Escalating to Expert
      return await escalateToExpert(ticketId, data.notes);
    }

    revalidatePath("/admin/ops");
    return { success: true };
  } catch (error) {
    console.error("Check-in Error:", error);
    return { success: false, error: "Tarkastuksen kirjaaminen epäonnistui." };
  }
}

export async function escalateToExpert(ticketId: string, notes?: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { apartment: true },
  });
  if (!ticket) return { error: "Ticket not found" };

  // 1. Create Observation with spatial metadata and association
  // Mapping spatial (x, y, z) metadata from apartment attributes
  const obs = await prisma.observation.create({
    data: {
      component: ticket.title,
      description: `${ticket.description}\n\nHuoltoyhtiön huomiot: ${notes || "Ei lisätietoja."}`,
      userId: ticket.createdById,
      housingCompanyId: ticket.housingCompanyId,
      status: "OPEN",
      location: ticket.apartment?.attributes
        ? JSON.stringify(ticket.apartment.attributes)
        : undefined, // Preserve spatial data
    },
  });

  // 2. Update Ticket to PROJECT category and link to Observation
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      observationId: obs.id,
      status: "OPEN",
      category: "PROJECT",
      triageLevel: "ESCALATED",
      huoltoNotes: notes,
    },
  });

  // 3. Log GDPR Event
  await RBAC.auditAccess(
    "system", // Should be current user
    "WRITE",
    `Observation:${obs.id}`,
    "Tiketin eskalaatio asiantuntijalle",
  );

  revalidatePath("/admin/ops");
  return { success: true, observationId: obs.id };
}

// Deprecated in favor of escalateToExpert but kept for compatibility if needed
export async function escalateTicketToObservation(ticketId: string) {
  return escalateToExpert(ticketId);
}

export async function assignTicketToMaintenance(ticketId: string) {
  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "IN_PROGRESS" },
    });

    // Log GDPR Event
    await RBAC.auditAccess(
      "system",
      "WRITE",
      `Ticket:${ticketId}`,
      "Tiketin määritys huoltoyhtiölle",
    );

    revalidatePath("/admin/ops");
    return { success: true };
  } catch (error) {
    console.error("Assign Error:", error);
    return { success: false, error: "Virhe määritettäessä huoltoa." };
  }
}

export async function submitTechnicalVerdict(
  observationId: string,
  data: {
    verdict: string;
    severity: number;
    boardSummary?: string;
  },
) {
  try {
    const updated = await prisma.observation.update({
      where: { id: observationId },
      data: {
        technicalVerdict: data.verdict,
        severityGrade: data.severity,
        boardSummary: data.boardSummary,
        status: "REVIEWED",
      },
      include: { housingCompany: true },
    });

    // 1. Log GDPR Event
    await RBAC.auditAccess(
      "expert", // Replace with real user ID
      "WRITE",
      `Observation:${observationId}`,
      "Teknisen lausunnon anto",
    );

    // 2. Update Real-time Health Status
    await HealthScoreEngine.recalculateBuildingHealth(updated.housingCompanyId);

    // 3. Revalidate
    revalidatePath("/admin/ops");
    revalidatePath("/"); // Update dashboard backlog scores

    return { success: true, data: updated };
  } catch (error) {
    console.error("Verdict Error:", error);
    return { success: false, error: "Failed to submit verdict." };
  }
}

export async function createProjectFromObservation(
  observationId: string,
  projectData: { title: string; type: string },
) {
  const obs = await prisma.observation.findUnique({
    where: { id: observationId },
    include: { housingCompany: true },
  });
  if (!obs) return { error: "Observation not found" };

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Project
    const project = await tx.project.create({
      data: {
        title: projectData.title || `Korjaus: ${obs.component}`,
        type: projectData.type || "MAINTENANCE",
        status: "TENDERING",
        housingCompanyId: obs.housingCompanyId,
        description: obs.description,
        observationId: obs.id,
      },
    });

    // 2. Link Observation to Project
    await tx.observation.update({
      where: { id: obs.id },
      data: { projectId: project.id },
    });

    return project;
  });

  revalidatePath("/admin/ops");
  revalidatePath("/governance/projects");
  return { success: true, projectId: result.id };
}

export async function completeProject(projectId: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { status: "COMPLETED" },
  });
  revalidatePath("/admin/ops");
  return { success: true };
}

export async function createTicket(data: {
  title: string;
  description: string;
  priority: TicketPriority;
  type: TicketType;
  category: TicketCategory;
  housingCompanyId: string;
  createdById: string;
  apartmentId?: string;
  imageUrl?: string;
  accessInfo?: string;
}) {
  try {
    // 1. Fetch User and Apartment Number
    const user = await prisma.user.findUnique({
      where: { id: data.createdById },
      select: { apartmentNumber: true, housingCompanyId: true },
    });

    // 2. Automated Triage Logic based on keywords
    let triageLevel: TriageLevel = TriageLevel.ROUTINE;
    const criticalKeywords = [
      "vuoto",
      "vesivahinko",
      "tulipalo",
      "sähköisku",
      "hissi",
    ];
    const escalatedKeywords = ["lämpö", "patteri", "lukko", "avain"];

    const searchStr = (data.title + " " + data.description).toLowerCase();

    if (criticalKeywords.some((k) => searchStr.includes(k))) {
      triageLevel = TriageLevel.CRITICAL;
    } else if (escalatedKeywords.some((k) => searchStr.includes(k))) {
      triageLevel = TriageLevel.ESCALATED;
    }

    // 2.5 Systemic Issue Check
    const systemicRisk = await HealthScoreEngine.checkSystemicIssue(
      data.housingCompanyId,
      data.title,
      data.description,
    );

    let huoltoNotes = "";
    if (systemicRisk?.isSystemic) {
      huoltoNotes = systemicRisk.message;
      triageLevel = TriageLevel.CRITICAL; // Escalate if systemic
    }

    // 3. Create Ticket with unitIdentifier for permanent history
    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: "OPEN",
        type: data.type,
        category: data.category,
        housingCompanyId: data.housingCompanyId,
        createdById: data.createdById,
        apartmentId: data.apartmentId || null,
        unitIdentifier: user?.apartmentNumber || "Yleiset tilat",
        triageLevel,
        imageUrl: data.imageUrl,
        accessInfo: data.accessInfo,
        huoltoNotes: huoltoNotes || undefined,
      },
    });

    // 4. Audit Log
    await RBAC.auditAccess(
      data.createdById,
      "WRITE",
      `Ticket:${ticket.id}`,
      `Uusi vikailmoitus luotu kohteeseen ${user?.apartmentNumber || "Yleiset tilat"}. ${systemicRisk?.isSystemic ? "Systeeminen riski havaittu." : ""}`,
    );

    revalidatePath("/admin/ops");
    revalidatePath("/maintenance/tickets");
    revalidatePath("/admin/dashboard");
    revalidatePath("/resident");

    return { success: true, ticket };
  } catch (error) {
    console.error("Create Ticket Error:", error);
    return { success: false, error: "Tiketin luonti epäonnistui." };
  }
}

export async function requestTicketInfo(ticketId: string, message: string) {
  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "OPEN", // Keep it open, but maybe we could add a "PENDING_INFO" status later
        huoltoNotes: `LISÄTIETOPYYNTÖ: ${message}`,
      },
    });

    // In a real app, this would trigger a push notification or email to the resident
    await RBAC.auditAccess(
      "board", // Replace with real session user
      "WRITE",
      `Ticket:${ticketId}`,
      "Lisätietopyyntö asukkaalle",
    );

    revalidatePath("/admin/ops");
    revalidatePath("/maintenance/tickets");
    return { success: true };
  } catch (error) {
    console.error("Request Info Error:", error);
    return { success: false, error: "Lisätietopyynnön lähetys epäonnistui." };
  }
}

export async function getTicketHistoryForLocation(apartmentId: string) {
  if (!apartmentId) return [];
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  return await prisma.ticket.findMany({
    where: {
      apartmentId,
      createdAt: { gte: twelveMonthsAgo },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
  });
}
