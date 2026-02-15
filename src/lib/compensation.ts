import { prisma } from "./db";
import { ResidentTaskStatus, RewardType } from "@prisma/client";

export const compensationLogic = {
  async approveTask(taskId: string, approvedById: string) {
    const task = await prisma.volunteerTask.findUnique({
      where: { id: taskId },
      include: { user: true },
    });

    if (!task) throw new Error("Task not found");
    if (task.status !== "REVIEW") throw new Error("Task is not in review");

    // 1. Update Task Status
    await prisma.volunteerTask.update({
      where: { id: taskId },
      data: { status: "COMPLETED" },
    });

    // 2. Trigger Compensation
    if (task.rewardType === "HOITOVASTIKE_CREDIT" && task.user?.apartmentId) {
      await this.applyInvoiceCredit(
        task.user.apartmentId,
        task.compensationAmount,
      );
    }

    // 3. Tax Reporting Automation
    await this.checkTaxThreshold(task.user?.id, task.compensationAmount);

    return { success: true };
  },

  async applyInvoiceCredit(apartmentId: string, amount: number) {
    // In a real system, this would create a credit note or a negative line item
    // for the next month's billing batch.
    console.log(
      `[FINANCE] Applying €${amount} credit to apartment ${apartmentId} next invoice.`,
    );

    // We could store this in a "CreditBuffer" table or similar.
    // For now, we just log it as the prompt asks for "Trigger an update".
  },

  async checkTaxThreshold(userId: string | undefined, newAmount: number) {
    if (!userId) return;

    // Mock annual total fetching
    const currentYearTotal = 450; // Mock value
    const newTotal = currentYearTotal + newAmount;
    const TAX_FREE_LIMIT = 500; // Example limit

    if (newTotal > TAX_FREE_LIMIT) {
      await this.generateTulorekisteriReport(userId, newAmount);
    }
  },

  async generateTulorekisteriReport(userId: string, amount: number) {
    console.log(
      `[TAX] Generating Tulorekisteri draft for user ${userId}. Amount: ${amount} €`,
    );
    // Would generate XML/API call to Incomes Register
  },
};
