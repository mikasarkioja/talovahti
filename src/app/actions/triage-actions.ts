"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TicketCategory, TriageLevel } from "@prisma/client";
import { sendResidentUpdate } from "@/lib/notifications";
import { RBAC } from "@/lib/auth/rbac";

/**
 * Escalates a resident ticket to a formal Project/Observation
 */
export async function escalateToExpert(ticketId: string) {
  try {
    // 1. Fetch the source ticket to get spatial data and description
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { apartment: true },
    });

    if (!ticket) throw new Error("Ticket not found");

    // 2. Create the Observation (The "Expert" entity)
    // We map the spatial data to ensure the 3D Digital Twin stays synced
    const observation = await prisma.observation.create({
      data: {
        component: ticket.title,
        description: ticket.description,
        status: "OPEN",
        location: ticket.apartment?.attributes
          ? JSON.stringify(ticket.apartment.attributes)
          : null,
        userId: ticket.createdById,
        housingCompanyId: ticket.housingCompanyId,
      },
    });

    // 3. Update the original ticket status and link it
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        category: TicketCategory.PROJECT,
        triageLevel: TriageLevel.ESCALATED,
        observationId: observation.id,
      },
    });

    revalidatePath("/admin/ops");
    await sendResidentUpdate(ticketId, "PROJECT");

    // Log GDPR Event
    await RBAC.auditAccess(
      "system",
      "WRITE",
      `Observation:${observation.id}`,
      "Tiketin eskalaatio asiantuntijalle",
    );

    return { success: true, observationId: observation.id };
  } catch (error) {
    console.error("Escalation failed:", error);
    return { success: false, error: "Failed to escalate ticket" };
  }
}

/**
 * Marks a ticket as routine maintenance for the huoltoyhtiö
 */
export async function markAsRoutine(ticketId: string, notes: string) {
  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        category: TicketCategory.MAINTENANCE,
        triageLevel: TriageLevel.ROUTINE,
        huoltoNotes: notes,
        status: "OPEN", // Keep it open for maintenance company to see
      },
    });

    revalidatePath("/admin/ops");
    await sendResidentUpdate(ticketId, "ROUTINE");
    return { success: true };
  } catch (error) {
    console.error("Routine update failed:", error);
    return { success: false, error: "Failed to update ticket" };
  }
}

export async function toggleTicketPublic(ticketId: string, isPublic: boolean) {
  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { isPublic },
    });
    revalidatePath("/admin/ops");
    revalidatePath("/maintenance/tickets");
    return { success: true };
  } catch (error) {
    console.error("Toggle Public Error:", error);
    return { success: false, error: "Julkisuuden muutos epäonnistui." };
  }
}
