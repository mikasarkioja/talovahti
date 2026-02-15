"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderType, OrderStatus, SignatureStatus } from "@prisma/client";
import { generateKSA2013, generateYSE1998 } from "@/lib/contracts";
import { signatureService } from "@/lib/services/signature";

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
 * Initiates digital signature via Visma Sign Mock.
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
      // Find Housing Company and User for signing
      const company = await tx.housingCompany.findUnique({
        where: { id: housingCompanyId },
        select: { name: true }
      });
      
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });

      // Find Project
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

      // 2. Initiate Digital Signature (Visma Sign Mock)
      const signingRequest = await signatureService.createSigningRequest({
        documentContent: contractContent,
        documentName: contractType === "KSA_2013" ? "Valvontasopimus.pdf" : "Uurakkasopimus.pdf",
        signers: [
          { name: user?.name || "Pekka Puheenjohtaja", email: user?.email || "pekka@taloyhtio.fi" }
        ]
      });

      // Create Order record
      const order = await tx.order.create({
        data: {
          userId,
          housingCompanyId,
          type: OrderType.EXPERT_SERVICE,
          amount,
          platformRevenue: platformFee,
          status: OrderStatus.PAID,
          metadata: JSON.stringify({ 
            expertId, 
            expertName, 
            contractType,
            signingDocumentId: signingRequest.documentId
          }),
        },
      });

      // Create Stripe Transaction
      await tx.stripeTransaction.create({
        data: {
          orderId: order.id,
          stripeChargeId: `ch_mock_${Date.now()}`,
          amount,
          currency: "EUR",
          platformFee,
          status: "succeeded",
        },
      });

      // Update Project with signature status
      if (projectId) {
        await tx.project.update({
          where: { id: projectId },
          data: {
            signatureStatus: SignatureStatus.PENDING,
            signatureUuid: signingRequest.documentId,
          }
        });

        await tx.legalContract.upsert({
          where: { projectId },
          create: {
            projectId,
            contractorId: expertId,
            contractorName: expertName,
            status: "DRAFT",
            content: contractContent,
          },
          update: {
            contractorId: expertId,
            contractorName: expertName,
            status: "DRAFT",
            content: contractContent,
          }
        });
      }

      // 3. GDPR & Audit Logs
      const auditMessage = contractType === "KSA_2013"
        ? `Hallitus lähetti valvontasopimuksen (KSA 2013) allekirjoitettavaksi valvojan ${expertName} kanssa.`
        : `Hallitus lähetti urakkasopimuksen (YSE 1998) allekirjoitettavaksi urakoitsijan ${expertName} kanssa.`;

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
            signatureUrl: signingRequest.signingUrl
          },
        },
      });

      await tx.gDPRLog.create({
        data: {
          actorId: userId,
          action: "WRITE",
          targetEntity: `Project:${projectId}`,
          resource: "LegalContract",
          reason: "Sopimuksen luonti ja allekirjoituskutsu",
        }
      });

      return { signingUrl: signingRequest.signingUrl };
    });

    revalidatePath("/");
    revalidatePath("/board/marketplace");
    if (projectId) revalidatePath(`/governance/projects/${projectId}`);

    return { success: true, signingUrl: result.signingUrl };
  } catch (error) {
    console.error("Order Expert Action Error:", error);
    return { success: false, error: "Allekirjoituskutsun lähettäminen epäonnistui." };
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
