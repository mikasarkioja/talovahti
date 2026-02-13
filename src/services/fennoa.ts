export interface FennoaInvoice {
  id: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  description: string;
  pdfUrl?: string;
}

class FennoaClient {
  private apiKey: string;
  private baseUrl: string = "https://api.fennoa.com/v1"; // Mock URL for development

  constructor() {
    this.apiKey = process.env.FENNOA_API_KEY || "mock-key";
  }

  /**
   * Fetches open purchase invoices (ostolaskut) from Fennoa.
   */
  async getPurchaseInvoices(): Promise<FennoaInvoice[]> {
    // In production, this would use fetch/axios with the Fennoa API
    console.log(`[Fennoa] Fetching open purchase invoices using API key...`);

    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Mock data for the MVP
    return [
      {
        id: "FEN-PUR-001",
        vendorName: "Kiinteistöhuolto Järvinen Oy",
        amount: 850.4,
        dueDate: "2026-02-28",
        description: "Tammikuun lumityöt ja hiekoitus",
        pdfUrl: "https://example.com/invoice1.pdf",
      },
      {
        id: "FEN-PUR-002",
        vendorName: "Hissihuolto Karhu",
        amount: 2100.0,
        dueDate: "2026-03-05",
        description: "Hissin vuositarkastus ja huolto",
        pdfUrl: "https://example.com/invoice2.pdf",
      },
      {
        id: "FEN-PUR-003",
        vendorName: "Energia-Apu Oy",
        amount: 5400.25,
        dueDate: "2026-02-20",
        description: "Lämpökeskuksen päivitys - ennakkomaksu",
        pdfUrl: "https://example.com/invoice3.pdf",
      },
    ];
  }

  /**
   * Approves a purchase invoice (ostolaskun hyväksyntä) in Fennoa.
   */
  async approveInvoice(invoiceId: string): Promise<boolean> {
    console.log(
      `[Fennoa] Sending approval for invoice ${invoiceId} to Fennoa...`,
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    return true;
  }
}

export const fennoa = new FennoaClient();
