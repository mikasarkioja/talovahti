// DTOs for Loan Brokerage System

export interface ShareholderDTO {
    name: string;
    businessId?: string;
    shareCount: number;
    isInstitutional: boolean;
}

export interface FinancialStatementDTO {
    year: number;
    revenue: number;
    maintenanceFees: number;
    loansTotal: number;
}

export interface HousingCompanyDetailsDTO {
    name: string;
    businessId: string;
    address: string;
    constructionYear: number;
}

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface RiskAnalysisResult {
    riskLevel: RiskLevel;
    concentrationRisk: {
        largestOwnerShare: number; // Percentage 0-100
        isHighRisk: boolean;
    };
    institutionalOwnership: {
        totalPercentage: number; // Percentage 0-100
    };
    topOwners: {
        name: string;
        shareCount: number;
        percentage: number;
    }[];
}
