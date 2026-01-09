import { MockInvoice, MockVendorRule } from '@/lib/store'
import { BudgetCategory } from '@prisma/client'

// Hardcoded Common Vendor Mappings
const DEFAULT_VENDOR_MAPPING: Record<string, BudgetCategory> = {
  '1234567-1': 'HEATING', // Fortum
  '2345678-2': 'WATER', // HSY
  '3456789-3': 'MAINTENANCE', // Lassila & Tikanoja
  '4567890-4': 'ADMIN', // Isännöintitoimisto
  '5678901-5': 'CLEANING', // SOL
}

// Keywords for description matching
const KEYWORD_MAPPING: Record<string, BudgetCategory> = {
  'lämpö': 'HEATING',
  'kaukolämpö': 'HEATING',
  'vesi': 'WATER',
  'jätevesi': 'WATER',
  'huolto': 'MAINTENANCE',
  'korjaus': 'MAINTENANCE',
  'siivous': 'CLEANING',
  'hallinto': 'ADMIN',
  'palkkio': 'ADMIN',
  'isännöinti': 'ADMIN'
}

type SuggestionResult = {
  category: BudgetCategory
  confidence: number // 0-100
  reason: 'RULE_MATCH' | 'ID_MATCH' | 'KEYWORD_MATCH' | 'DEFAULT'
}

export function suggestCategory(
  invoice: MockInvoice, 
  userRules: MockVendorRule[]
): SuggestionResult {
  
  // 1. Check User Rules (Highest Priority)
  if (invoice.yTunnus) {
    const rule = userRules.find(r => r.yTunnus === invoice.yTunnus)
    if (rule) {
      return { category: rule.category, confidence: 100, reason: 'RULE_MATCH' }
    }
  }

  // 2. Check Static ID Mapping
  if (invoice.yTunnus && DEFAULT_VENDOR_MAPPING[invoice.yTunnus]) {
    return { category: DEFAULT_VENDOR_MAPPING[invoice.yTunnus], confidence: 95, reason: 'ID_MATCH' }
  }

  // 3. Keyword Matching (Name or Description)
  const text = `${invoice.vendorName} ${invoice.description || ''}`.toLowerCase()
  for (const [keyword, category] of Object.entries(KEYWORD_MAPPING)) {
    if (text.includes(keyword)) {
      return { category, confidence: 70, reason: 'KEYWORD_MATCH' }
    }
  }

  // 4. Fallback
  return { category: 'MAINTENANCE', confidence: 10, reason: 'DEFAULT' }
}

export function getRequiredApprovers(invoice: MockInvoice): string[] {
  const approvers: string[] = []

  // High Value Rule
  if (invoice.amount > 2000) {
    approvers.push('CHAIRMAN', 'MEMBER') // Need at least two
    return approvers
  }

  // Category Routing
  switch (invoice.category) {
    case 'MAINTENANCE':
    case 'HEATING':
    case 'WATER':
    case 'CLEANING':
      approvers.push('TECHNICAL_MEMBER') // Technical/Maintenance responsible
      break
    case 'ADMIN':
      approvers.push('CHAIRMAN')
      break
    default:
      approvers.push('BOARD') // Any board member
  }

  return approvers
}
