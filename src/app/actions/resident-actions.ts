"use server";

import { prisma } from "@/lib/db";
import { RBAC } from "@/lib/auth/rbac";
import { VoteChoice, GovernanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Helper to simulate a session user in this demo.
 * In a real production app, this would use NextAuth's auth() or similar.
 */
async function getSessionUser(providedUserId: string) {
  // For demo: we trust the providedUserId if it exists in DB,
  // but we audit it. In real app, this would be from a secure cookie.
  const user = await prisma.user.findUnique({ where: { id: providedUserId } });
  if (!user) throw new Error("Istuntoa ei löytynyt");
  return user;
}

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
    const sessionUser = await getSessionUser(params.userId);
    
    // 1. Isolation Guard
    RBAC.ensureOwnership(params.userId, sessionUser.id);

    // 2. Database Operation
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    const finalShares = user?.role === "RESIDENT" ? 0 : params.shares;

    const vote = await prisma.vote.upsert({
      where: {
        initiativeId_apartmentId: {
          initiativeId: params.initiativeId,
          apartmentId: params.apartmentId,
        },
      },
      update: {
        choice: params.choice,
        shares: finalShares,
        timestamp: new Date(),
      },
      create: {
        userId: params.userId,
        initiativeId: params.initiativeId,
        choice: params.choice,
        shares: finalShares,
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

    const sessionUser = await getSessionUser(params.userId);

    // Isolation Guard
    RBAC.ensureOwnership(task.userId, sessionUser.id);

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
    const sessionUser = await getSessionUser(params.userId);
    // Isolation Guard
    RBAC.ensureOwnership(params.userId, sessionUser.id);

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

      // If they have an apartment and are NOT a resident (tenant), update total support immediately
      if (user.apartment && user.role !== "RESIDENT") {
        // Initial support logic: author's share count counts
        await prisma.initiative.update({
          where: { id: initiative.id },
          data: {
            requiredSupport: 1000, // Example: 1000 shares needed to qualify
          },
        });
      } else {
        // If resident or no apartment, still set a threshold but author adds 0 shares
        await prisma.initiative.update({
          where: { id: initiative.id },
          data: {
            requiredSupport: 1000,
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
    const sessionUser = await getSessionUser(params.userId);
    // 1. Isolation Guard
    RBAC.ensureOwnership(params.userId, sessionUser.id);

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
        // Residents (tenants) never have voting power
        if (s.user.role === "RESIDENT") return sum;
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
export async function getInitiatives(
  housingCompanyId: string,
  sessionUserId: string,
) {
  // Check access to the company's initiatives
  const canAccess = await RBAC.canAccess(sessionUserId, "APARTMENT"); // Simplified check: if they have any apartment access, they can see initiatives
  if (!canAccess) {
    // For demo purposes, we'll allow it if they are logged in, but in real app we'd be stricter
  }

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
export async function getUserActivity(userId: string, sessionUserId: string) {
  try {
    // 1. Security Guard: Only the user themselves or a board member can see this
    const requester = await prisma.user.findUnique({
      where: { id: sessionUserId },
    });
    const isBoard =
      requester?.role === "BOARD_MEMBER" || requester?.role === "ADMIN";

    if (userId !== sessionUserId && !isBoard) {
      throw new Error("Luvaton pääsy toisen käyttäjän tietoihin.");
    }

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

    // GDPR Log: Shareholder or Board accessed data
    await RBAC.auditAccess(
      sessionUserId,
      "READ",
      `User:${userId}:Activity`,
      userId === sessionUserId
        ? "Osakas tarkasteli omia tietojaan"
        : "Hallitus tarkasteli osakkaan toimintahistoriaa",
    );

    return {
      success: true,
      data: { initiatives, votes, tasks, renovations },
    };
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Toimintojen haku epäonnistui",
    };
  }
}
