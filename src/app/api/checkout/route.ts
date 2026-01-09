import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, type, amount, housingCompanyId } = body

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Calculate Platform Revenue
    // For Certificates: 100% to Platform
    // For Subscriptions: 100% to Platform
    // (Minus Stripe fees ~3% usually, but for tracking we record gross or net as defined. Prompt says 100% of transaction)
    let platformRevenue = 0
    if (type === 'CERTIFICATE' || type === 'SUBSCRIPTION') {
      platformRevenue = amount
    } else {
        // e.g. for split revenue items
        platformRevenue = amount * 0.3 // 30% commission example
    }

    // 2. Simulate Payment Gateway (Stripe/Paytrail)
    await new Promise(resolve => setTimeout(resolve, 800))

    // 3. Success Response with Revenue Split Data
    // In a real app, this would create the Order record in DB
    return NextResponse.json({
      success: true,
      orderId: `ord-${Date.now()}`,
      status: 'PAID',
      platformRevenue,
      message: 'Payment processed and revenue routed.'
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
