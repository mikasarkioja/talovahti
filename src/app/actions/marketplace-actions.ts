"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderType, OrderStatus } from "@prisma/client";
import { generateKSA2013, generateYSE1998 } from "@/lib/contracts";

interface OrderExpertParams {
  expertId: string;
  expertName: string;
  housingCompanyId: string;
  userId: string;
  amount: number;
  contractType: "KSA_2013" | "YSE_1998";
  projectId?: string;
}

/**
 * Handles ordering an expert or contractor from the marketplace.
 * Logs to AuditLog, generates contract, and calculates XP/Health boost.
 */
export async function orderExpertAction({
  expertId,
  expertName,
  housingCompanyId,
  userId,
  amount,
  contractType,
  projectId,
}: OrderExpertParams) {
  try {
    const platformFee = amount * 0.05;

    // 1. Start Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find Housing Company for contract generation
      const company = await tx.housingCompany.findUnique({
        where: { id: housingCompanyId },
        select: { name: true }
      });

      // Find Project if it exists
      const project = projectId ? await tx.project.findUnique({
        where: { id: projectId },
        select: { title: true }
      }) : null;

      const projectTitle = project?.title || "Nimetön hanke";
      const companyName = company?.name || "As Oy Esimerkki";

      // Generate Contract Content
      const contractContent = contractType === "KSA_2013" 
        ? generateKSA2013({ companyName, expertName, projectTitle, fee: amount })
        : generateYSE1998({ companyName, contractorName: expertName, projectTitle, contractPrice: amount });

      // Create Order record
      const order = await tx.order.create({
        data: {
          userId,
          housingCompanyId,
          type: OrderType.EXPERT_SERVICE,
          amount,
          platformRevenue: platformFee,
          status: OrderStatus.PAID,
          metadata: JSON.stringify({ expertId, expertName, contractType }),
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

      // If project exists, create/update LegalContract
      if (projectId) {
        await tx.legalContract.upsert({
          where: { projectId },
          create: {
            projectId,
            contractorId: expertId,
            contractorName: expertName,
            status: "SIGNED",
            content: contractContent,
            signedAt: new Date(),
          },
          update: {
            contractorId: expertId,
            contractorName: expertName,
            status: "SIGNED",
            content: contractContent,
            signedAt: new Date(),
          }
        });
      }

      // 2. Add Audit Log with professional Finnish text
      const auditMessage = contractType === "KSA_2013"
        ? `Hallitus hyväksyi Konsulttitoiminnan yleiset ehdot (KSA 2013) valvojan ${expertName} kanssa.`
        : `Hallitus hyväksyi Rakennusurakan yleiset ehdot (YSE 1998) urakoitsijan ${expertName} kanssa.`;

      await tx.auditLog.create({
        data: {
          action: "EXPERT_ORDERED",
          userId,
          targetId: expertId,
          metadata: {
            amount,
            platformFee,
            expertName,
            contractType,
            message: auditMessage,
            status: "SIGNED",
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
    if (projectId) revalidatePath(`/governance/projects/${projectId}`);

    return { success: true, transactionId: result.id };
  } catch (error) {
    console.error("Order Expert Action Error:", error);
    return { success: false, error: "Tilaus tai sopimuksen luonti epäonnistui." };
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
