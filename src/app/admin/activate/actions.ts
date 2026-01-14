'use server'

import { MMLClient, MMLCompanyData } from '@/lib/mml/client'
import { SyncService } from '@/lib/onboarding/sync-service'

export async function verifyCompany(yTunnus: string) {
    // 1. Check valid format
    if (!/^\d{7}-\d$/.test(yTunnus)) {
        return { error: 'Invalid Y-Tunnus format' }
    }

    // 2. Fetch MML Data
    try {
        const data = await MMLClient.fetchCompanyStructure(yTunnus)
        return { success: true, data }
    } catch (e) {
        return { error: 'Failed to fetch MML data' }
    }
}

export async function activateCompany(data: MMLCompanyData) {
    try {
        // Mock Actor ID (The board member doing this)
        const actorId = 'cm5tv6k1e0000356glk1e7k1e' 
        const company = await SyncService.initializeDatabaseFromMML(data, actorId)
        return { success: true, companyId: company.id }
    } catch (e) {
        console.error(e)
        return { error: 'Activation failed' }
    }
}
