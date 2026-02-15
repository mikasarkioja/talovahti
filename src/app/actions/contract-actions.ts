// src/app/actions/contract-actions.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RBAC } from "@/lib/auth/rbac";
import { ProjectStatus } from "@prisma/client";

export async function acceptBidAction(data: {
  tenderId: string;
  bidId: string;
  userId: string;
}) {
  try {
    const tender = await prisma.tender.findUnique({
      where: { id: data.tenderId },
      include: {
        bids: true,
        project: {
          include: {
            housingCompany: true,
          },
        },
      },
    });

    if (!tender) throw new Error("Tarjouskilpailua ei löytynyt.");

    // Select winner and reject others in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update winning bid
      const winner = await tx.tenderBid.update({
        where: { id: data.bidId },
        data: {
          status: "ACCEPTED",
          isWinner: true,
        },
      });

      // 2. Reject others
      await tx.tenderBid.updateMany({
        where: {
          tenderId: data.tenderId,
          id: { not: data.bidId },
        },
        data: {
          status: "REJECTED",
          isWinner: false,
        },
      });

      // 3. Update project status to CONTRACT
      await tx.project.update({
        where: { id: tender.projectId },
        data: { status: ProjectStatus.CONTRACT },
      });

      // 5. Update BidInvitation to mark used if not already (safeguard)
      if (winner.vendorId) {
        await tx.bidInvitation.updateMany({
          where: {
            projectId: tender.projectId,
            vendorId: winner.vendorId,
          },
          data: { usedAt: new Date() },
        });
      }

      // 4. Audit Log
      await RBAC.auditAccess(
        data.userId,
        "ACCEPT_BID",
        `Tender:${data.tenderId}`,
        `Hallitus hyväksyi tarjouksen ${winner.price}€. Sopimusluonnos generoitu ja lähetetty urakoitsijalle. Projektin tila päivitetty: CONTRACT.`,
      );
    });

    // 5. Success UI Redirect Path (Simulated - in real app would trigger email)
    const invitation = await prisma.bidInvitation.findFirst({
      where: {
        projectId: tender.projectId,
        vendorId:
          tender.bids.find((b) => b.id === data.bidId)?.vendorId || undefined,
      },
    });

    revalidatePath(`/governance/projects/${tender.projectId}`);
    revalidatePath("/admin/ops");

    return {
      success: true,
      magicLink: invitation ? `/bid/success/${invitation.token}` : null,
    };
  } catch (error) {
    console.error("Accept Bid Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Virhe tarjouksen hyväksymisessä.",
    };
  }
}

/**
 * Hydrates YSE 1998 contract template with real data
 */
export async function generateYSE1998(bidId: string) {
  const bid = await prisma.tenderBid.findUnique({
    where: { id: bidId },
    include: {
      tender: {
        include: {
          project: {
            include: {
              housingCompany: true,
            },
          },
        },
      },
      vendor: true,
    },
  });

  if (!bid) throw new Error("Tarjousta ei löytynyt");

  const company = bid.tender.project.housingCompany;
  const project = bid.tender.project;
  const vendor = bid.vendor;

  const contractorShare = bid.price * 0.95;
  const platformFee = bid.price * 0.05;
  const totalWithCommission = bid.price;

  return {
    title: `URAKKASOPIMUS (YSE 1998): ${project.title}`,
    date: new Date().toLocaleDateString("fi-FI"),
    parties: {
      employer: {
        name: company.name,
        id: company.id,
        address: "Keskuskatu 1, 00100 Helsinki", // Mock address
      },
      contractor: {
        name: vendor?.name || bid.companyName,
        id: vendor?.id || "Y-tunnus puuttuu",
      },
    },
    scope: project.description,
    financials: {
      contractPrice: bid.price,
      contractorShare: contractorShare,
      platformFee: platformFee,
      total: totalWithCommission,
      paymentTerms:
        "Maksut suoritetaan valmiusasteen mukaan. Alustan 5% palvelumaksu vähennetään automaattisesti Stripen kautta jokaisesta tilityksestä.",
    },
    legal: "Noudatamme Rakennusalan yleisiä sopimusehtoja (YSE 1998).",
  };
}
