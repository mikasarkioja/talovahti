import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getErpAdapter } from "@/lib/adapters/fivaldi-adapter";
import { riskEngine } from "@/lib/engines/risk-analysis";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { businessId, amount, purpose } = body;

        if (!businessId) {
            return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
        }

        // 1. Fetch Data via Adapter
        const adapter = getErpAdapter();
        const [details, financials, shareholders] = await Promise.all([
            adapter.fetchCompanyDetails(businessId),
            adapter.fetchFinancials(businessId),
            adapter.fetchShareholders(businessId)
        ]);

        // 2. Persist Raw Data (Simplified: Update/Create HousingCompany and related data)
        // In a real scenario, we might want to version this or snapshot it.
        const housingCompany = await prisma.housingCompany.upsert({
            where: { businessId: details.businessId },
            create: {
                businessId: details.businessId,
                name: details.name,
                address: details.address,
                city: "Unknown", // Adapter didn't provide city separately in mock
                postalCode: "00000",
                constructionYear: details.constructionYear
            },
            update: {
                constructionYear: details.constructionYear
            }
        });

        // Clear old financials/shareholders for this company (Simple sync strategy)
        await prisma.financialStatement.deleteMany({ where: { housingCompanyId: housingCompany.id } });
        await prisma.shareholder.deleteMany({ where: { housingCompanyId: housingCompany.id } });

        await prisma.financialStatement.createMany({
            data: financials.map(f => ({ ...f, housingCompanyId: housingCompany.id }))
        });

        await prisma.shareholder.createMany({
            data: shareholders.map(s => ({ ...s, housingCompanyId: housingCompany.id }))
        });

        // 3. Run Risk Engine
        const riskResult = riskEngine.analyzeInvestorRisk(shareholders);

        // 4. Create Loan Application
        const application = await prisma.loanApplication.create({
            data: {
                housingCompanyId: housingCompany.id,
                amount: Number(amount) || 0,
                purpose: purpose || "General Renovation",
                status: 'ANALYSIS',
                riskAnalysis: JSON.stringify(riskResult)
            }
        });

        return NextResponse.json({
            success: true,
            applicationId: application.id,
            company: details,
            riskAnalysis: riskResult
        });

    } catch (error: any) {
        console.error("Loan Application Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
