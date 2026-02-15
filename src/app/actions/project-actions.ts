"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  MilestoneStatus,
  ProjectStatus,
  ObservationStatus,
} from "@prisma/client";
import { gamification } from "@/lib/engines/gamification";
import { HealthScoreEngine } from "@/lib/engines/health";

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
        select: { housingCompanyId: true, title: true },
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
        },
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
            message: `Hallitus hyväksyi maksuerän "${title}" (${amount.toLocaleString("fi-FI")} €) hankkeelle ${project.title}.`,
          },
        },
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
          totalXP: { increment: 100 },
        },
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

/**
 * Completes a project, updates health scores, and archives records.
 */
export async function completeProjectAction(projectId: string, userId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find project and related data
      const project = await tx.project.findUnique({
        where: { id: projectId },
        include: { observation: true },
      });

      if (!project) throw new Error("Project not found");

      // 2. Calculate warranty end date (2 years as per YSE 1998)
      const warrantyEndDate = new Date();
      warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + 2);

      // 3. Update Project Status
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: {
          status: ProjectStatus.COMPLETED,
          warrantyEndDate,
        },
      });

      // 4. Close linked Observation if it exists
      if (project.observationId) {
        await tx.observation.update({
          where: { id: project.observationId },
          data: { status: "CLOSED" as ObservationStatus },
        });
      }

      // 5. Archive linked Audit Logs
      await tx.auditLog.updateMany({
        where: { targetId: projectId },
        data: {
          metadata: {
            push: { archiveStatus: "ARCHIVED_PERMANENT" },
          },
        },
      });

      // 6. Recalculate Building Health (Technical score improves as Observation is CLOSED)
      const newHealth = await HealthScoreEngine.recalculateBuildingHealth(
        project.housingCompanyId,
        tx,
      );

      // 7. Reward Board (+500 XP and Achievement)
      const boardProfile = await tx.boardProfile.upsert({
        where: { housingCompanyId: project.housingCompanyId },
        create: {
          housingCompanyId: project.housingCompanyId,
          totalXP: 500,
          level: 1,
          achievements: [
            {
              slug: "project-completed",
              name: "Hanke valmis",
              description:
                "Hallitus on vienyt rakennushankkeen onnistuneesti loppuun.",
              date: new Date(),
            },
          ],
        },
        update: {
          totalXP: { increment: 500 },
          achievements: {
            push: {
              slug: "project-completed",
              name: "Hanke valmis",
              description:
                "Hallitus on vienyt rakennushankkeen onnistuneesti loppuun.",
              date: new Date(),
            },
          },
        },
      });

      // 8. Create Final Audit Log
      await tx.auditLog.create({
        data: {
          action: "PROJECT_COMPLETED",
          userId,
          targetId: projectId,
          metadata: {
            projectTitle: project.title,
            newHealthScore: newHealth.total,
            message:
              "Vastaanottotarkastus suoritettu. Sopimus siirretty takuuvaiheeseen ja hanke arkistoitu.",
          },
        },
      });

      return { updatedProject, newHealth };
    });

    revalidatePath("/");
    revalidatePath(`/governance/projects/${projectId}`);

    return {
      success: true,
      message: `Urakka on onnistuneesti arkistoitu. Taloyhtiön kuntoindeksi nousi arvoon ${result.newHealth.total}.`,
      data: result,
    };
  } catch (error) {
    console.error("Complete Project Error:", error);
    return { success: false, error: "Hankkeen päättäminen epäonnistui." };
  }
}
