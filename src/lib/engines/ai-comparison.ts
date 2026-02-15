// talovahti/src/lib/engines/ai-comparison.ts
import { prisma } from "@/lib/db";

/**
 * AI Analysis Service for Bid Comparison.
 * This mocks the LLM call but follows the logic of comparing against legal standards (KSA/YSE).
 */
export const AIComparisonEngine = {
  async analyzeBids(tenderId: string) {
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: { bids: true, project: true },
    });

    if (!tender) throw new Error("Tender not found");

    const analysisResults = [];

    for (const bid of tender.bids) {
      // Mocking LLM Analysis Logic
      let score = 80;
      let riskNote = "Vakioehdot täyttyvät.";

      const legalStandard =
        tender.type === "SUPERVISOR" ? "KSA 2013" : "YSE 1998";
      const bidText = (bid.notes || "").toLowerCase();

      // Simple keyword detection for compliance check (Mocking AI)
      if (bidText.includes("poikkeus") || bidText.includes("lisäkulu")) {
        score -= 20;
        riskNote = `HUOM: Tarjous poikkeaa ${legalStandard} vakioehdoista. Mahdollisia piilokuluja havaittu.`;
      }

      if (bid.price > (tender.project.estimatedCost || 0) * 1.5) {
        score -= 10;
        riskNote += " Hinta huomattavasti yli arvion.";
      }

      // Calculate Stripe Commission (5%)
      const stripeCommission = bid.price * 0.05;

      // Update the bid with AI analysis
      await prisma.tenderBid.update({
        where: { id: bid.id },
        data: {
          aiScore: score,
          aiRiskNote: riskNote,
          stripeCommission: stripeCommission,
        },
      });

      analysisResults.push({ bidId: bid.id, score, riskNote });
    }

    const summary = `AI analysoi ${tender.bids.length} tarjousta. Vertailu suoritettu ${tender.type === "SUPERVISOR" ? "KSA 2013" : "YSE 1998"} standardien mukaan.`;

    await prisma.tender.update({
      where: { id: tenderId },
      data: { aiAnalysisSummary: summary },
    });

    return { summary, results: analysisResults };
  },
};
