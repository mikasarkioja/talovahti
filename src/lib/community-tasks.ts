import { prisma } from "./db";
import { notificationService } from "./notifications";
import { RewardType } from "@prisma/client";

export const communityTasks = {
  async createTask(
    housingCompanyId: string,
    title: string,
    description: string,
    compensationAmount: number,
    rewardType: RewardType,
    userId: string,
  ) {
    // 1. Create Task in DB
    const task = await prisma.volunteerTask.create({
      data: {
        housingCompanyId,
        title,
        description,
        compensationAmount,
        rewardType,
        status: "OPEN",
        userId,
      },
    });

    // 2. Notify Residents (Step 5 Requirement)
    await notificationService.sendPush(
      "ALL_RESIDENTS",
      "Uusi Talkootehtävä julkaistu! 🧹",
      `"${title}" on nyt tarjolla. Palkkio: ${compensationAmount}€ (${rewardType === "HOITOVASTIKE_CREDIT" ? "Vastikehyvitys" : "Rahapalkkio"})`,
      { taskId: task.id },
    );

    return task;
  },

  async getTasks(housingCompanyId: string) {
    return prisma.volunteerTask.findMany({
      where: { housingCompanyId },
      orderBy: { createdAt: "desc" },
    });
  },
};
