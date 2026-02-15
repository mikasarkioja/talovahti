// src/app/actions/tender-actions.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RBAC } from "@/lib/auth/rbac";
import { AIComparisonEngine } from "@/lib/engines/ai-comparison";

/**
 * Runs AI analysis on all bids in a tender.
 */
export async function runAIAnalysis(tenderId: string, userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role === "RESIDENT") throw new Error("Ei oikeuksia.");

    const result = await AIComparisonEngine.analyzeBids(tenderId);

    await RBAC.auditAccess(
      userId,
      "AI_ANALYSIS",
      `Tender:${tenderId}`,
      "AI-vertailu suoritettu tarjouksille",
    );

    revalidatePath(`/governance/projects`);
    return { success: true, summary: result.summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tuntematon virhe";
    return { success: false, error: message };
  }
}

/**
 * Selects a winning bid for a tender.
 * Implements XP reward for competitive bidding and logs the decision.
 */
export async function selectWinningBid(data: {
  tenderId: string;
  bidId: string;
  userId: string;
  reason: string;
}) {
  try {
    const tender = await prisma.tender.findUnique({
      where: { id: data.tenderId },
      include: { bids: true, project: true },
    });

    if (!tender) throw new Error("Tarjouskilpailua ei löytynyt.");

    // 1. RBAC Check
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user || (user.role !== "BOARD_MEMBER" && user.role !== "ADMIN")) {
      throw new Error(
        "Pääsy evätty. Vain hallituksen jäsenet voivat tehdä päätöksiä.",
      );
    }

    // 2. Select the winner
    await prisma.$transaction(async (tx) => {
      // Reset all bids to not winners
      await tx.tenderBid.updateMany({
        where: { tenderId: data.tenderId },
        data: { isWinner: false },
      });

      // Mark the chosen one
      const winner = await tx.tenderBid.update({
        where: { id: data.bidId },
        data: { isWinner: true, status: "SELECTED" },
      });

      // Update tender status
      await tx.tender.update({
        where: { id: data.tenderId },
        data: { status: "CLOSED" },
      });

      // 3. XP Logic: Award +100 XP if at least 3 bids were requested
      if (tender.bids.length >= 3) {
        await tx.user.update({
          where: { id: data.userId },
          data: { xp: { increment: 100 } },
        });

        // Log XP Gain
        await tx.auditLog.create({
          data: {
            userId: data.userId,
            action: "XP_GAIN",
            targetId: data.tenderId,
            metadata: {
              points: 100,
              reason:
                "Hyvä hallintotapa: Kilpailutus vähintään kolmella tarjouksella",
            },
          },
        });
      }

      // 4. Audit Log: Decision record
      await RBAC.auditAccess(
        data.userId,
        "DECISION",
        `Tender:${data.tenderId}`,
        `Valittu urakoitsija: ${winner.companyName}. Perustelu: ${data.reason}`,
      );
    });

    revalidatePath(`/governance/projects/${tender.projectId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Valinta epäonnistui.";
    console.error("Select Bid Error:", error);
    return { success: false, error: message };
  }
}

/**
 * Expert updates their recommendation for a tender.
 */
export async function updateExpertRecommendation(data: {
  tenderId: string;
  vendorName: string;
  reason: string;
  userId: string;
}) {
  try {
    // 1. RBAC Check (Expert only)
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user || user.role !== "EXPERT") {
      throw new Error("Vain asiantuntija voi antaa suosituksen.");
    }

    await prisma.tender.update({
      where: { id: data.tenderId },
      data: {
        expertRecommendationId: data.vendorName,
        expertRecommendationReason: data.reason,
      },
    });

    // Audit log the recommendation
    await RBAC.auditAccess(
      data.userId,
      "RECOMMEND",
      `Tender:${data.tenderId}`,
      `Asiantuntijan suositus annettu: ${data.vendorName}`,
    );

    revalidatePath(`/governance/projects`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tuntematon virhe";
    return { success: false, error: message };
  }
}
