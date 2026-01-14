import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { reference, date, signature } = body

        // Verify signature (Mock)
        if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

        // Find Invoice
        const invoice = await prisma.monthlyFee.findFirst({
            where: { referenceNumber: reference }
        })

        if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

        // Update Status
        await prisma.monthlyFee.update({
            where: { id: invoice.id },
            data: { status: 'PAID' }
        })

        // Karma Logic
        const paymentDate = new Date(date)
        const earlyThreshold = new Date(invoice.dueDate)
        earlyThreshold.setDate(earlyThreshold.getDate() - 2)

        if (paymentDate < earlyThreshold) {
            // Find User via Apartment (simplified: find first user in apartment)
            // Ideally, we link invoice to user, but here it is linked to apartment.
            const apt = await prisma.apartment.findUnique({
                where: { id: invoice.apartmentId },
                include: { users: true }
            })
            
            // Award karma to the first resident found (or splitting it?)
            // For MVP, give to the first one found.
            const user = apt?.users[0]
            if (user) {
                await prisma.wallet.upsert({
                    where: { userId: user.id },
                    create: { userId: user.id, karmaBalance: 50 },
                    update: { karmaBalance: { increment: 50 } }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
}
