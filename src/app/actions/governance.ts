// src/app/actions/governance.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { GovernanceStatus, VoteChoice } from "@prisma/client";

/* ==========================================
   1. VOTING LOGIC (Decision Making)
   ========================================== */

export async function castVote(
  initiativeId: string,
  choice: "YES" | "NO" | "ABSTAIN",
) {
  try {
    const session = { user: { id: "user-board-1" } }; // Mock session
    if (!session?.user) throw new Error("Unauthorized");

    // 1. Verify Initiative is open for voting
    const initiative = await prisma.initiative.findUnique({
      where: { id: initiativeId },
      include: { housingCompany: true },
    });

    if (!initiative || initiative.status !== GovernanceStatus.VOTING) {
      throw new Error("Voting is not currently open for this initiative.");
    }

    // 2. Fetch User's Apartment and Share Count
    const userApartment = await prisma.apartment.findFirst({
      where: {
        users: { some: { id: session.user.id } },
        housingCompanyId: initiative.housingCompanyId,
      },
      select: { id: true, shareCount: true },
    });

    if (!userApartment) throw new Error("Only verified owners can vote.");

    // Check for existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        initiativeId_apartmentId: {
          initiativeId,
          apartmentId: userApartment.id,
        },
      },
    });

    if (existingVote) {
      throw new Error("Tämä huoneisto on jo äänestänyt.");
    }

    // 3. Persist the weighted vote
    await prisma.vote.create({
      data: {
        initiativeId,
        userId: session.user.id,
        apartmentId: userApartment.id,
        choice: choice as VoteChoice,
        shares: userApartment.shareCount,
      },
    });

    revalidatePath(`/dashboard/governance/${initiativeId}`);
    return { success: true };
  } catch (error) {
    console.error("Voting Error:", error);
    return {
      success: false,
      error: (error as Error).message || "Failed to cast vote.",
    };
  }
}

/* ==========================================
   2. ANNUAL CLOCK LOGIC (Planning)
   ========================================== */

export async function getAnnualClockData(companyId: string, year: number) {
  try {
    const company = await prisma.housingCompany.findUnique({
      where: { id: companyId },
      select: {
        fiscalConfig: { select: { startMonth: true } },
      },
    });

    const tasks = await prisma.annualTask.findMany({
      where: {
        housingCompanyId: companyId,
        // Fetch tasks for this year (via deadline) OR all recurring tasks (via month)
        // If we treat AnnualTask as recurring template defined by month:
        // We just fetch all.
        // But schema has `deadline`.
        // If we want specific instances for `year`:
        deadline: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      orderBy: { month: "asc" },
    });

    // Group by month (1-12)
    const monthlyGroups = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1;
      return {
        month: monthIndex,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tasks: tasks.filter((t: any) => t.month === monthIndex),
      };
    });

    return {
      success: true,
      data: {
        fiscalYearStart: company?.fiscalConfig?.startMonth || 1,
        monthlyGroups,
        totalTasks: tasks.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        completedTasks: tasks.filter((t: any) => t.completedAt).length,
      },
    };
  } catch (error) {
    console.error("Annual Clock Fetch Error:", error);
    return { success: false, error: "Failed to load annual clock data." };
  }
}

/**
 * Marks a task in the Annual Clock as done/not done
 */
export async function toggleTaskCompletion(
  taskId: string,
  isCompleted: boolean,
) {
  try {
    const updated = await prisma.annualTask.update({
      where: { id: taskId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    revalidatePath("/dashboard/governance");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update task." };
  }
}
