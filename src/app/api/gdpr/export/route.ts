import { NextResponse } from 'next/server'
import { GDPRTools } from '@/lib/gdpr-tools'
import { withAudit } from '@/lib/auth/audit'

async function handler(req: Request) {
    try {
        // Mock User ID - In prod, use session
        const userId = req.headers.get('x-user-id') || 'cm5tv6k1e0000356glk1e7k1e' 
        
        const data = await GDPRTools.generateDataPortabilityArchive(userId)
        
        return new NextResponse(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="talovahti-data-${userId}.json"`
            }
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
    }
}

export const GET = withAudit('DATA_EXPORT', handler)
