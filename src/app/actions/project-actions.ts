"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MilestoneStatus } from "@prisma/client";
import { gamification } from "@/lib/engines/gamification";

/**
 * Approves a milestone payment.
 * Updates milestone status, creates audit log, and rewards board XP.
 */
export async function approveMilestoneAction(params: {
  milestoneId: string;
  projectId: string;
  userId: string;
  amount: number;
  title: string;
}) {
  try {
    const { milestoneId, projectId, userId, amount, title } = params;

    // 1. Transactional Update
    await prisma.$transaction(async (tx) => {
      // Find project to get housingCompanyId
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { housingCompanyId: true, title: true }
      });

      if (!project) throw new Error("Project not found");

      // Update Milestone
      await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          status: MilestoneStatus.PAID,
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: userId,
          isPaid: true,
          paidAt: new Date(),
        }
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          action: "MILESTONE_PAID",
          userId,
          targetId: milestoneId,
          metadata: {
            projectId,
            projectTitle: project.title,
            milestoneTitle: title,
            amount,
            message: `Hallitus hyväksyi maksuerän "${title}" (${amount.toLocaleString("fi-FI")} €) hankkeelle ${project.title}.`
          }
        }
      });

      // Reward Board XP (+100 XP for milestone approval)
      await tx.boardProfile.upsert({
        where: { housingCompanyId: project.housingCompanyId },
        create: {
          housingCompanyId: project.housingCompanyId,
          totalXP: 100,
          level: 1,
        },
        update: {
          totalXP: { increment: 100 }
        }
      });
    });

    revalidatePath(`/governance/projects/${params.projectId}/execution`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Approve Milestone Error:", error);
    return { success: false, error: "Maksuerän hyväksyntä epäonnistui." };
  }
}
