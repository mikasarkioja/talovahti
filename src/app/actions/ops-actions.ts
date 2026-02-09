"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type KanbanItem = {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
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

  // 1. INBOX (Open Tickets, Not yet escalated)
  const tickets = await prisma.ticket.findMany({
    where: { status: "OPEN", observationId: null },
    orderBy: { createdAt: "desc" },
    include: { createdBy: true },
  });

  tickets.forEach((t) =>
    items.push({
      id: t.id,
      title: t.title,
      subtitle: t.createdBy.name || "Unknown",
      status: t.status,
      stage: "INBOX",
      priority: t.priority as KanbanItem["priority"],
      type: "TICKET",
      date: t.createdAt,
    }),
  );

  // 2. ASSESSMENT (Observations with/without Expert Opinion)
  const observations = await prisma.observation.findMany({
    where: { status: { in: ["OPEN", "REVIEWED"] } },
    include: { assessment: true, ticket: true },
  });

  observations.forEach((o) => {
    // If it has an assessment recommending action, it might be ready for Marketplace
    const hasVerdict = !!o.assessment;

    // Filter out those already linked to a project (Execution phase)
    // (Assuming we'd link Obs -> Renovation -> Project in a real app,
    // for now we check if it's "Done" or not)

    items.push({
      id: o.id,
      title: o.component,
      subtitle: hasVerdict ? "Asiantuntija arvioinut" : "Odottaa arviota",
      status: o.status,
      stage: hasVerdict ? "MARKETPLACE" : "ASSESSMENT",
      priority: "MEDIUM", // Default
      type: "OBSERVATION",
      date: o.createdAt,
      meta: { verdict: o.assessment?.technicalVerdict },
    });
  });

  // 3. EXECUTION (Active Projects)
  const projects = await prisma.project.findMany({
    where: { status: { not: "COMPLETED" } },
  });

  projects.forEach((p) => {
    let stage: KanbanItem["stage"] = "EXECUTION";
    if (p.status === "TENDERING") stage = "MARKETPLACE";
    if (p.status === "WARRANTY") stage = "VERIFICATION";

    items.push({
      id: p.id,
      title: p.title,
      subtitle: `Status: ${p.status}`,
      status: p.status,
      stage: stage,
      priority: "HIGH",
      type: "PROJECT",
      date: p.createdAt,
    });
  });

  return items;
}

// TRANSITIONS

export async function escalateTicketToObservation(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { apartment: true },
  });
  if (!ticket) return { error: "Ticket not found" };

  // 1. Create Observation with spatial metadata and association
  const obs = await prisma.observation.create({
    data: {
      component: ticket.title,
      description: ticket.description,
      userId: ticket.createdById,
      housingCompanyId: ticket.housingCompanyId,
      status: "OPEN",
      location: ticket.apartment?.attributes
        ? JSON.stringify(ticket.apartment.attributes)
        : undefined, // Preserve spatial data if attached to apartment
    },
  });

  // 2. Link Ticket to Observation and update status
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { observationId: obs.id, status: "IN_PROGRESS" },
  });

  // 3. Log GDPR Event
  await prisma.gDPRLog.create({
    data: {
      actorId: "system", // In a real app, use the current user session ID
      action: "ESCALATE_TICKET",
      targetEntity: `Observation:${obs.id}`,
      details: `Escalated Ticket ${ticketId} to Observation.`,
      housingCompanyId: ticket.housingCompanyId,
    },
  });

  revalidatePath("/admin/ops");
  return { success: true, observationId: obs.id };
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
