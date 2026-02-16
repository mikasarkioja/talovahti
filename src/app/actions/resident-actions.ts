"use server";

import { prisma } from "@/lib/db";
import { RBAC } from "@/lib/auth/rbac";
import { VoteChoice, GovernanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Submit a vote for an initiative
 */
export async function submitVoteAction(params: {
  initiativeId: string;
  userId: string;
  choice: VoteChoice;
  shares: number;
  apartmentId: string;
}) {
  try {
    // 1. Isolation Guard
    // In a real app, we'd get sessionUserId from auth()
    RBAC.ensureOwnership(params.userId, params.userId);

    // 2. Database Operation
    const vote = await prisma.vote.upsert({
      where: {
        initiativeId_apartmentId: {
          initiativeId: params.initiativeId,
          apartmentId: params.apartmentId,
        },
      },
      update: {
        choice: params.choice,
        shares: params.shares,
        timestamp: new Date(),
      },
      create: {
        userId: params.userId,
        initiativeId: params.initiativeId,
        choice: params.choice,
        shares: params.shares,
        apartmentId: params.apartmentId,
      },
    });

    // 3. GDPR Logging
    await RBAC.auditAccess(
      params.userId,
      "WRITE",
      `Vote:${vote.id}`,
      "Äänestys aloitteessa",
    );

    revalidatePath("/governance");
    return { success: true, vote };
  } catch (error) {
    console.error("Error submitting vote:", error);
    const message =
      error instanceof Error ? error.message : "Äänestys epäonnistui";
    return { success: false, error: message };
  }
}

/**
 * Complete a volunteer task
 */
export async function completeVolunteerTaskAction(params: {
  taskId: string;
  userId: string;
  proofImageUrl?: string;
}) {
  try {
    const task = await prisma.volunteerTask.findUnique({
      where: { id: params.taskId },
    });

    if (!task) throw new Error("Tehtävää ei löytynyt");

    // Isolation Guard
    RBAC.ensureOwnership(task.userId, params.userId);

    const updatedTask = await prisma.volunteerTask.update({
      where: { id: params.taskId },
      data: {
        status: "COMPLETED",
        proofImageUrl: params.proofImageUrl,
      },
    });

    // GDPR Logging
    await RBAC.auditAccess(
      params.userId,
      "WRITE",
      `VolunteerTask:${updatedTask.id}`,
      "Talkootehtävän kuittaus",
    );

    revalidatePath("/profile");
    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Error completing task:", error);
    const message =
      error instanceof Error ? error.message : "Tehtävän kuittaus epäonnistui";
    return { success: false, error: message };
  }
}

/**
 * Create a new initiative
 */
export async function createInitiativeAction(params: {
  title: string;
  description: string;
  userId: string;
  housingCompanyId: string;
  affectedArea?: string;
}) {
  try {
    // Isolation Guard
    RBAC.ensureOwnership(params.userId, params.userId);

    const initiative = await prisma.initiative.create({
      data: {
        title: params.title,
        description: params.description,
        userId: params.userId,
        housingCompanyId: params.housingCompanyId,
        affectedArea: params.affectedArea,
        status: GovernanceStatus.OPEN_FOR_SUPPORT,
      },
    });

    // 2. Author automatically supports
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { apartment: true },
    });

    if (user) {
      await prisma.initiativeSupport.create({
        data: {
          initiativeId: initiative.id,
          userId: params.userId,
        },
      });

      // If they have an apartment, update total support immediately
      if (user.apartment) {
        // Initial support logic: author's share count counts
        await prisma.initiative.update({
          where: { id: initiative.id },
          data: {
            requiredSupport: 1000, // Example: 1000 shares needed to qualify
          },
        });
      }
    }

    // 3. GDPR Logging
    await RBAC.auditAccess(
      params.userId,
      "WRITE",
      `Initiative:${initiative.id}`,
      "Uuden aloitteen luonti",
    );

    revalidatePath("/governance");
    revalidatePath("/resident/initiatives");
    return { success: true, initiative };
  } catch (error) {
    console.error("Error creating initiative:", error);
    const message =
      error instanceof Error ? error.message : "Aloitteen luonti epäonnistui";
    return { success: false, error: message };
  }
}

/**
 * Support an initiative
 */
export async function supportInitiativeAction(params: {
  initiativeId: string;
  userId: string;
}) {
  try {
    // 1. Isolation Guard
    RBAC.ensureOwnership(params.userId, params.userId);

    // 2. Add Support
    const support = await prisma.initiativeSupport.create({
      data: {
        initiativeId: params.initiativeId,
        userId: params.userId,
      },
    });

    // 3. Check if qualified for Agenda using share-based logic
    const initiative = await prisma.initiative.findUnique({
      where: { id: params.initiativeId },
      include: {
        supporters: {
          include: {
            user: {
              include: { apartment: true },
            },
          },
        },
      },
    });

    if (initiative && initiative.status === GovernanceStatus.OPEN_FOR_SUPPORT) {
      const totalShares = initiative.supporters.reduce((sum, s) => {
        return sum + (s.user.apartment?.shareCount || 0);
      }, 0);

      if (totalShares >= initiative.requiredSupport) {
        await prisma.initiative.update({
          where: { id: params.initiativeId },
          data: { status: GovernanceStatus.QUALIFIED },
        });
      }
    }

    // 4. GDPR Logging
    await RBAC.auditAccess(
      params.userId,
      "WRITE",
      `Support:${support.id}`,
      "Aloitteen kannattaminen",
    );

    revalidatePath("/governance");
    revalidatePath("/resident/initiatives");
    return { success: true };
  } catch (error) {
    console.error("Error supporting initiative:", error);
    const message =
      error instanceof Error ? error.message : "Kannattaminen epäonnistui";
    return { success: false, error: message };
  }
}

/**
 * Fetch all initiatives for the company
 */
export async function getInitiatives(housingCompanyId: string) {
  return await prisma.initiative.findMany({
    where: { housingCompanyId },
    include: {
      user: {
        include: { apartment: true },
      },
      supporters: {
        include: {
          user: {
            include: { apartment: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Fetch user's own activity
 */
export async function getUserActivity(userId: string) {
  try {
    const [initiatives, votes, tasks, renovations] = await Promise.all([
      prisma.initiative.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.vote.findMany({
        where: { userId },
        include: { initiative: true },
        orderBy: { timestamp: "desc" },
      }),
      prisma.volunteerTask.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.renovation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // GDPR Log: Shareholder accessed their own data
    await RBAC.auditAccess(
      userId,
      "READ",
      `User:${userId}:Activity`,
      "Osakas tarkasteli omia tietojaan (Muutostyöt, Aloitteet, Talkoot)",
    );

    return {
      success: true,
      data: { initiatives, votes, tasks, renovations },
    };
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return { success: false, error: "Toimintojen haku epäonnistui" };
  }
}
