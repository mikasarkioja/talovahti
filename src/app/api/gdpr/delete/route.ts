import { NextResponse } from 'next/server'
import { GDPRTools } from '@/lib/gdpr-tools'
import { withAudit } from '@/lib/auth/audit'

async function handler(req: Request) {
    try {
        const userId = req.headers.get('x-user-id') || 'cm5tv6k1e0000356glk1e7k1e'
        
        await GDPRTools.anonymizeUser(userId)
        
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
}

export const DELETE = withAudit('ACCOUNT_DELETION', handler)
