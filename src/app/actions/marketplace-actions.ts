"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderType, OrderStatus } from "@prisma/client";

interface OrderExpertParams {
  expertId: string;
  expertName: string;
  housingCompanyId: string;
  userId: string;
  amount: number;
}

/**
 * Handles ordering an expert from the marketplace.
 * Logs to AuditLog and calculates XP/Health boost.
 */
export async function orderExpertAction({
  expertId,
  expertName,
  housingCompanyId,
  userId,
  amount,
}: OrderExpertParams) {
  try {
    const platformFee = amount * 0.05;

    // 1. Start Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Order record first
      const order = await tx.order.create({
        data: {
          userId,
          housingCompanyId,
          type: OrderType.EXPERT_SERVICE,
          amount,
          platformRevenue: platformFee,
          status: OrderStatus.PAID,
          metadata: JSON.stringify({ expertId, expertName }),
        },
      });

      // Create Stripe Transaction record
      const transaction = await tx.stripeTransaction.create({
        data: {
          orderId: order.id,
          stripeChargeId: `ch_mock_${Date.now()}`,
          amount,
          currency: "EUR",
          platformFee,
          status: "succeeded",
        },
      });

      // 2. Add Audit Log
      await tx.auditLog.create({
        data: {
          action: "EXPERT_ORDERED",
          userId,
          targetId: expertId,
          metadata: {
            amount,
            platformFee,
            expertName,
            status: "ORDERED",
          },
        },
      });

      // 3. Update XP & Health Score
      const boost = await calculateHealthBoost("EXPERT_USAGE");
      
      // Update Company Health
      await tx.housingCompany.update({
        where: { id: housingCompanyId },
        data: {
          healthScore: { increment: boost.health },
        },
      });

      // Update Board XP
      await tx.boardProfile.upsert({
        where: { housingCompanyId },
        create: {
          housingCompanyId,
          totalXP: boost.xp,
          level: 1,
        },
        update: {
          totalXP: { increment: boost.xp },
        },
      });

      return transaction;
    });

    revalidatePath("/");
    revalidatePath("/board/marketplace");

    return { success: true, transactionId: result.id };
  } catch (error) {
    console.error("Order Expert Action Error:", error);
    return { success: false, error: "Asiantuntijan tilaus epäonnistui." };
  }
}

/**
 * XP & Health Score Engine
 * Defines how different actions boost the housing company status.
 */
export async function calculateHealthBoost(
  actionType: "EXPERT_USAGE" | "PREVENTIVE_MAINTENANCE" | "ENERGY_SAVING",
) {
  switch (actionType) {
    case "EXPERT_USAGE":
      return { xp: 50, health: 5 }; // XP++, High boost
    case "PREVENTIVE_MAINTENANCE":
      return { xp: 25, health: 3 }; // XP+, Medium boost
    case "ENERGY_SAVING":
      return { xp: 40, health: 4 }; // XP++, Good boost
    default:
      return { xp: 5, health: 1 };
  }
}
