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

    // 3. Persist the weighted vote
    await prisma.vote.create({
      data: {
        initiativeId,
        userId: session.user.id,
        // apartmentId: userApartment.id, // Removed as per primary schema
        choice: choice as VoteChoice,
        shares: userApartment.shareCount, // Mapped to 'shares' field
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
        companyId: companyId,
        deadline: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      orderBy: { deadline: "asc" },
    });

    // Mocking monthly groups logic
    const monthlyGroups = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1;
      return {
        month: monthIndex,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tasks: tasks.filter(
          (t: any) =>
            t.deadline && new Date(t.deadline).getMonth() + 1 === monthIndex,
        ),
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
export async function toggleAnnualTask(taskId: string, isCompleted: boolean) {
  try {
    const updated = await prisma.annualTask.update({
      where: { id: taskId },
      data: { completedAt: isCompleted ? new Date() : null },
    });

    revalidatePath("/dashboard/governance");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update task." };
  }
}
