import { ErpAdapter } from "./erp-adapter.interface";
import { FinancialStatementDTO, HousingCompanyDetailsDTO, ShareholderDTO } from "../types/loan-brokerage";

export class MockFivaldiAdapter implements ErpAdapter {
    async fetchCompanyDetails(businessId: string): Promise<HousingCompanyDetailsDTO> {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));

        if (businessId === 'NOT_FOUND') throw new Error('Company not found');

        return {
            name: "As Oy Esimerkkikatu 123",
            businessId: businessId,
            address: "Esimerkkikatu 123, 00100 Helsinki",
            constructionYear: 1985
        };
    }

    async fetchFinancials(businessId: string): Promise<FinancialStatementDTO[]> {
        return [
            { year: 2025, revenue: 150000, maintenanceFees: 145000, loansTotal: 500000 },
            { year: 2024, revenue: 148000, maintenanceFees: 140000, loansTotal: 550000 },
        ];
    }

    async fetchShareholders(businessId: string): Promise<ShareholderDTO[]> {
        // Mock data with some concentration to test risk engine
        return [
            { name: "Sijoitusyhtiö Alpha Oy", businessId: "1234567-8", shareCount: 2500, isInstitutional: true }, // 25% (High Risk)
            { name: "Matti Meikäläinen", shareCount: 500, isInstitutional: false },
            { name: "Maija Meikäläinen", shareCount: 500, isInstitutional: false },
            { name: "Kiinteistösijoitus Beta Oy", businessId: "8765432-1", shareCount: 1000, isInstitutional: true },
            ...Array(40).fill(null).map((_, i) => ({
                name: `Osakas ${i + 5}`,
                shareCount: 100, // Remaining 5500 shares distributed
                isInstitutional: false
            }))
        ];
    }
}

// Factory to switch between Real and Mock
export const getErpAdapter = (): ErpAdapter => {
    // In real app: if (process.env.USE_REAL_FIVALDI === 'true') return new FivaldiAdapterService();
    return new MockFivaldiAdapter();
}
