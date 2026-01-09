import { MockInvoice } from '@/lib/store'
import { BudgetCategory, InvoiceStatus } from '@prisma/client'

// Mock Data Source simulating Netvisor/Procountor API response
const MOCK_API_INVOICES = [
  {
    externalId: 'ext-001',
    vendorName: 'Fortum Oyj',
    amount: 1250.50,
    dueDate: new Date(new Date().getTime() + 86400000 * 7), // +7 days
    category: 'HEATING' as BudgetCategory,
    imageUrl: 'https://placehold.co/600x800/png?text=Fortum+Lasku'
  },
  {
    externalId: 'ext-002',
    vendorName: 'Lassila & Tikanoja',
    amount: 450.00,
    dueDate: new Date(new Date().getTime() + 86400000 * 14), // +14 days
    category: 'MAINTENANCE' as BudgetCategory,
    imageUrl: 'https://placehold.co/600x800/png?text=Huoltolasku'
  },
  {
    externalId: 'ext-003',
    vendorName: 'Isännöinti Oy',
    amount: 800.00,
    dueDate: new Date(new Date().getTime() + 86400000 * 2), // +2 days
    category: 'ADMIN' as BudgetCategory,
    imageUrl: 'https://placehold.co/600x800/png?text=Hallinto'
  }
]

export const accountingApi = {
  fetchNewInvoices: async (): Promise<MockInvoice[]> => {
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Map to internal format
    return MOCK_API_INVOICES.map((inv, idx) => ({
      id: `inv-${Date.now()}-${idx}`,
      externalId: inv.externalId,
      vendorName: inv.vendorName,
      amount: inv.amount,
      dueDate: inv.dueDate,
      status: 'PENDING' as InvoiceStatus,
      category: inv.category,
      projectId: null,
      approvedById: null,
      imageUrl: inv.imageUrl,
      createdAt: new Date(),
      yTunnus: '1234567-8', 
      description: `Lasku toimittajalta ${inv.vendorName}`
    }))
  },

  pushApprovalStatus: async (externalId: string, status: InvoiceStatus, approvedBy: string) => {
    // Simulate API Call to Netvisor
    console.log(`[AccountingAPI] Pushing status ${status} for invoice ${externalId} (User: ${approvedBy})`)
    await new Promise(resolve => setTimeout(resolve, 500))
    return true
  }
}
