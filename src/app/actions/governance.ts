// src/app/actions/governance.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { GovernanceStatus, VoteChoice } from "@prisma/client";

/* ==========================================
   1. VOTING & INITIATIVES LOGIC
   ========================================== */

export async function createInitiative(formData: {
  title: string;
  description: string;
  housingCompanyId: string;
  authorId: string;
}) {
  try {
    const initiative = await prisma.initiative.create({
      data: {
        title: formData.title,
        description: formData.description,
        housingCompanyId: formData.housingCompanyId,
        authorId: formData.authorId,
        status: GovernanceStatus.OPEN_FOR_SUPPORT,
      },
    });

    revalidatePath("/governance/pipeline");
    revalidatePath("/governance/voting");
    return { success: true, data: initiative };
  } catch (error) {
    console.error("Create Initiative Error:", error);
    return { success: false, error: "Aloitteen luonti epäonnistui." };
  }
}

export async function updateInitiativeStatus(
  initiativeId: string,
  status: GovernanceStatus,
) {
  try {
    await prisma.initiative.update({
      where: { id: initiativeId },
      data: { status },
    });

    revalidatePath("/governance/pipeline");
    revalidatePath("/governance/voting");
    return { success: true };
  } catch (error) {
    console.error("Update Status Error:", error);
    return { success: false, error: "Tilan päivitys epäonnistui." };
  }
}

export async function castVote(
  initiativeId: string,
  choice: "YES" | "NO" | "ABSTAIN",
  userId: string,
) {
  try {
    // 1. Verify Initiative is open for voting
    const initiative = await prisma.initiative.findUnique({
      where: { id: initiativeId },
      include: { housingCompany: true },
    });

    if (!initiative || initiative.status !== GovernanceStatus.VOTING) {
      throw new Error("Äänestys ei ole tällä hetkellä avoinna.");
    }

    // 2. Fetch User's Apartment and Share Count
    const userApartment = await prisma.apartment.findFirst({
      where: {
        users: { some: { id: userId } },
        housingCompanyId: initiative.housingCompanyId,
      },
      select: { id: true, shareCount: true },
    });

    if (!userApartment) throw new Error("Vain varmistetut osakkaat voivat äänestää.");

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
        userId: userId,
        apartmentId: userApartment.id,
        choice: choice as VoteChoice,
        shares: userApartment.shareCount,
      },
    });

    revalidatePath(`/governance/voting`);
    return { success: true };
  } catch (error) {
    console.error("Voting Error:", error);
    return {
      success: false,
      error: (error as Error).message || "Äänestys epäonnistui.",
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
        OR: [
          { deadline: null },
          {
            deadline: {
              gte: new Date(`${year}-01-01`),
              lte: new Date(`${year}-12-31`),
            },
          },
        ],
      },
      orderBy: { month: "asc" },
    });

    // Group by month (1-12)
    const monthlyGroups = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1;
      return {
        month: monthIndex,
        tasks: tasks.filter((t) => t.month === monthIndex),
      };
    });

    return {
      success: true,
      data: {
        fiscalYearStart: company?.fiscalConfig?.startMonth || 1,
        monthlyGroups,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.isCompleted).length,
      },
    };
  } catch (error) {
    console.error("Annual Clock Fetch Error:", error);
    return { success: false, error: "Vuosikellon lataaminen epäonnistui." };
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

    revalidatePath("/"); // Revalidate dashboard
    revalidatePath("/governance/pipeline");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Toggle Task Error:", error);
    return { success: false, error: "Tehtävän päivitys epäonnistui." };
  }
}

export async function createAnnualTask(data: {
  title: string;
  category: any; // TaskCategory
  month: number;
  housingCompanyId: string;
  isStatutory?: boolean;
  description?: string;
}) {
  try {
    // Calculate quarter based on month (1-3=Q1, 4-6=Q2, etc.)
    const quarter =
      data.month <= 3
        ? "Q1"
        : data.month <= 6
          ? "Q2"
          : data.month <= 9
            ? "Q3"
            : "Q4";

    const task = await prisma.annualTask.create({
      data: {
        title: data.title,
        category: data.category,
        month: data.month,
        quarter: quarter as any,
        housingCompanyId: data.housingCompanyId,
        isStatutory: data.isStatutory || false,
        description: data.description,
      },
    });

    revalidatePath("/");
    return { success: true, data: task };
  } catch (error) {
    console.error("Create Task Error:", error);
    return { success: false, error: "Tehtävän luonti epäonnistui." };
  }
}
