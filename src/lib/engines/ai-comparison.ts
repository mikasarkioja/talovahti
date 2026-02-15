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

  /**
   * Generates a professional RFP summary based on an expert's observation.
   */
  async getAiRfpSummary(observationId: string) {
    const observation = await prisma.observation.findUnique({
      where: { id: observationId },
      include: { assessment: true },
    });

    if (!observation) throw new Error("Observation not found");

    const category = observation.component;
    const verdict =
      observation.technicalVerdict ||
      observation.assessment?.technicalVerdict ||
      "Ei määritelty";

    // Mocking LLM RFP generation
    return `
URAKKAPYYNTÖ: ${category.toUpperCase()}
KOHTEEN KUVAUS:
Taloyhtiössä on havaittu tarve korjaukselle kohteessa "${category}". 
Teknisen asiantuntijan arvio: "${verdict}".

VAATIMUKSET:
- Työ on suoritettava YSE 1998 mukaisesti.
- Urakoitsijalla on oltava voimassa olevat vastuuvakuutukset.
- Referenssit vastaavista kohteista katsotaan eduksi.

PYYDETTY TOIMENPIDE:
Toimittakaa kiinteähintainen tarjous sisältäen materiaalit, työn ja mahdolliset lisäkulut.
    `.trim();
  },
};
