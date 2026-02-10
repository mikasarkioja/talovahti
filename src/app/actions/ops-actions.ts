"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
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
  status: string;
  category?: TicketCategory;
  triageLevel?: TriageLevel;
  huoltoNotes?: string | null;
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

export async function getOpsBoardItems(): Promise<KanbanItem[]> {
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
      status: t.status,
      category: t.category,
      triageLevel: t.triageLevel,
      huoltoNotes: t.huoltoNotes,
      stage: "INBOX",
      priority: t.priority as KanbanItem["priority"],
      type: "TICKET",
      date: t.createdAt,
      meta: {
        hasLocation: !!t.apartment?.attributes,
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
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: "CLOSED",
          huoltoNotes: data.notes,
          triageLevel: "ROUTINE",
        },
      });
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
  await prisma.gDPRLog.create({
    data: {
      actorId: "system", // Should be current user
      action: "ESCALATE_TO_EXPERT",
      targetEntity: `Observation:${obs.id}`,
      details: `Escalated Ticket ${ticketId} to Expert Project. Notes: ${notes}`,
      housingCompanyId: ticket.housingCompanyId,
    },
  });

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
    await prisma.gDPRLog.create({
      data: {
        actorId: "system",
        action: "ASSIGN_TO_MAINTENANCE",
        targetEntity: `Ticket:${ticketId}`,
        details: `Ticket assigned directly to maintenance company.`,
        housingCompanyId: "default-company-id", // Should be fetched from ticket
      },
    });

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
    await prisma.gDPRLog.create({
      data: {
        actorId: "expert", // Replace with real user ID
        action: "SUBMIT_TECHNICAL_VERDICT",
        targetEntity: `Observation:${observationId}`,
        details: `Severity: ${data.severity}, Verdict: ${data.verdict.substring(0, 50)}...`,
        housingCompanyId: updated.housingCompanyId,
      },
    });

    // 2. Revalidate
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
  housingCompanyId: string;
  createdById: string;
  apartmentId?: string;
}) {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: "OPEN",
        type: data.type,
        housingCompanyId: data.housingCompanyId,
        createdById: data.createdById,
        apartmentId: data.apartmentId || null,
      },
    });

    revalidatePath("/admin/ops");
    revalidatePath("/maintenance/tickets");
    return { success: true, ticket };
  } catch (error) {
    console.error("Create Ticket Error:", error);
    return { success: false, error: "Tiketin luonti epäonnistui." };
  }
}
