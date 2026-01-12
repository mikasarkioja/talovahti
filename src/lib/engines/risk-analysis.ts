import { RiskAnalysisResult, ShareholderDTO } from "../types/loan-brokerage";

export const riskEngine = {
    analyzeInvestorRisk(shareholders: ShareholderDTO[]): RiskAnalysisResult {
        const totalShares = shareholders.reduce((sum, s) => sum + s.shareCount, 0);
        
        if (totalShares === 0) {
             return {
                riskLevel: 'RED',
                concentrationRisk: { largestOwnerShare: 0, isHighRisk: true },
                institutionalOwnership: { totalPercentage: 0 },
                topOwners: []
            };
        }

        // 1. Concentration Risk
        const sorted = [...shareholders].sort((a, b) => b.shareCount - a.shareCount);
        const largestOwner = sorted[0];
        const largestOwnerShare = (largestOwner.shareCount / totalShares) * 100;
        const isConcentrationHigh = largestOwnerShare > 20;

        // 2. Institutional Ownership
        const institutionalShares = shareholders
            .filter(s => s.isInstitutional)
            .reduce((sum, s) => sum + s.shareCount, 0);
        const institutionalPercentage = (institutionalShares / totalShares) * 100;

        // 3. Risk Level Determination
        let riskLevel: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
        
        if (largestOwnerShare > 20 || institutionalPercentage > 40) {
            riskLevel = 'YELLOW';
        }
        if (largestOwnerShare > 40 || institutionalPercentage > 60) {
            riskLevel = 'RED';
        }

        return {
            riskLevel,
            concentrationRisk: {
                largestOwnerShare: Number(largestOwnerShare.toFixed(2)),
                isHighRisk: isConcentrationHigh
            },
            institutionalOwnership: {
                totalPercentage: Number(institutionalPercentage.toFixed(2))
            },
            topOwners: sorted.slice(0, 10).map(s => ({
                name: s.name,
                shareCount: s.shareCount,
                percentage: Number(((s.shareCount / totalShares) * 100).toFixed(2))
            }))
        };
    }
}
