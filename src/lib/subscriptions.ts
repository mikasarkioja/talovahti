import { MockSubscription, useStore } from './store'
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client'

export const PRICING_TIERS = {
  BASIC: {
    id: 'BASIC',
    price: 49.00,
    limitApartments: 20,
    features: ['DIGITAL_TWIN', 'BOARD_TOOLS'],
    label: 'Basic'
  },
  PRO: {
    id: 'PRO',
    price: 149.00,
    limitApartments: 9999, // Unlimited
    features: ['DIGITAL_TWIN', 'BOARD_TOOLS', 'MML_SYNC', 'DOC_GENERATION'],
    label: 'Pro'
  },
  PREMIUM: {
    id: 'PREMIUM',
    price: 299.00,
    limitApartments: 9999,
    features: ['DIGITAL_TWIN', 'BOARD_TOOLS', 'MML_SYNC', 'DOC_GENERATION', 'PRIORITY_SUPPORT', 'WHITE_LABEL'],
    label: 'Premium'
  }
}

export function isSubscriptionActive(subscription: MockSubscription): boolean {
  if (subscription.status !== 'ACTIVE') return false
  // Check if past due (allow 7 days grace period in real logic, here strict)
  // if (subscription.nextBillingDate && new Date() > subscription.nextBillingDate) return false
  return true
}

export function checkAccess(
  subscription: MockSubscription, 
  featureKey: string,
  currentApartmentCount: number
): { allowed: boolean; reason?: string } {
  
  // 1. Status Check
  if (!isSubscriptionActive(subscription)) {
    return { allowed: false, reason: 'Subscription is inactive or past due.' }
  }

  const plan = PRICING_TIERS[subscription.plan as keyof typeof PRICING_TIERS]
  
  // 2. Limit Check
  if (currentApartmentCount > plan.limitApartments) {
    return { allowed: false, reason: `Apartment limit exceeded for ${plan.label} plan (${plan.limitApartments}).` }
  }

  // 3. Feature Check (Simplified mock features logic, usually features are in a separate list)
  // For now, assuming basic features are always available, others gated by plan implicitly
  if (featureKey === 'MML_SYNC' && subscription.plan === 'BASIC') {
    return { allowed: false, reason: 'Upgrade to PRO for MML Sync.' }
  }
  
  if (featureKey === 'WHITE_LABEL' && subscription.plan !== 'PREMIUM') {
    return { allowed: false, reason: 'Upgrade to PREMIUM for White Labeling.' }
  }

  return { allowed: true }
}

export function calculateMRR(subscriptions: MockSubscription[]): number {
  return subscriptions.reduce((sum, sub) => {
    if (sub.status !== 'ACTIVE') return sum
    const price = PRICING_TIERS[sub.plan as keyof typeof PRICING_TIERS]?.price || 0
    return sum + price
  }, 0)
}
