import { ShareholderDTO, FinancialStatementDTO, HousingCompanyDetailsDTO } from "../types/loan-brokerage";

export interface ErpAdapter {
    fetchCompanyDetails(businessId: string): Promise<HousingCompanyDetailsDTO>;
    fetchFinancials(businessId: string): Promise<FinancialStatementDTO[]>;
    fetchShareholders(businessId: string): Promise<ShareholderDTO[]>;
}
