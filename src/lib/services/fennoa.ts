// src/lib/services/fennoa.ts

export interface FennoaInvoice {
  id: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  invoiceNumber: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
}

export class FennoaClient {
  private static mockInvoices: FennoaInvoice[] = [
    { id: 'inv_1', vendorName: 'Espoon Putki Oy', amount: 450.00, dueDate: '2026-02-20', invoiceNumber: '2026-101', status: 'PENDING' },
    { id: 'inv_2', vendorName: 'Siivouspalvelu Ässä', amount: 1200.00, dueDate: '2026-02-25', invoiceNumber: '2026-55', status: 'PENDING' },
    { id: 'inv_3', vendorName: 'Sähkö-Arska', amount: 5200.00, dueDate: '2026-02-15', invoiceNumber: '2026-99', status: 'PENDING' }, // Triggeröi Guardrailin!
  ];

  async getPurchaseInvoices(): Promise<FennoaInvoice[]> {
    // Simuloidaan verkkoviivettä
    await new Promise(resolve => setTimeout(resolve, 500));
    return FennoaClient.mockInvoices.filter(inv => inv.status === 'PENDING');
  }

  async approveInvoice(invoiceId: string): Promise<{ success: boolean }> {
    console.log(`[Fennoa Mock] Approving invoice: ${invoiceId}`);
    const invoice = FennoaClient.mockInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      invoice.status = 'APPROVED';
      return { success: true };
    }
    return { success: false };
  }
}

export const fennoa = new FennoaClient();
