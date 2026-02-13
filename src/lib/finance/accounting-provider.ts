import { prisma } from "@/lib/db";

export interface PendingInvoice {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  imageUrl?: string;
}

export const AccountingProvider = {
  async fetchPendingInvoices(
    housingCompanyId: string,
  ): Promise<PendingInvoice[]> {
    // Mock External API Call
    console.log(
      `[Accounting API] Fetching pending invoices for ${housingCompanyId}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return mock data combined with local DB status if needed
    // For now, return pure mocks that mimic what we'd get from Fennoa/Procountor
    return [
      {
        id: "ext-inv-001",
        vendor: "Lassila & Tikanoja Oyj",
        amount: 1250.0,
        dueDate: "2026-02-15",
        imageUrl: "/invoices/mock-cleaning.pdf",
      },
      {
        id: "ext-inv-002",
        vendor: "Helen Sähköverkko Oy",
        amount: 450.2,
        dueDate: "2026-02-20",
        imageUrl: "/invoices/mock-energy.pdf",
      },
    ];
  },

  async approveInvoice(invoiceId: string, userId: string): Promise<boolean> {
    console.log(
      `[Accounting API] Approving invoice ${invoiceId} by user ${userId}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log to Audit Trail
    // Find user's housing company to log correctly
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { housingCompany: true },
    });
    if (user) {
      await prisma.gDPRLog.create({
        data: {
          action: "WRITE",
          actorId: userId,
          resource: `Invoice:${invoiceId}`,
          reason: "APPROVE_INVOICE",
          housingCompanyId: user.housingCompanyId,
          details: `Approved external invoice ${invoiceId}`,
        },
      });
    }

    return true;
  },

  async syncBankBalance(
    housingCompanyId?: string,
  ): Promise<{ balance: number; currency: string }> {
    // Mock Bank API
    return {
      balance: 45200.5,
      currency: "EUR",
    };
  },
};
