import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { iotRelays } from '@/lib/iot-relays'
import { notificationService } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  try {
    // 1. Find bookings starting in ~45 mins (e.g. between 40 and 50 mins from now)
    const now = new Date()
    const targetStart = new Date(now.getTime() + 45 * 60 * 1000)
    const windowStart = new Date(targetStart.getTime() - 5 * 60 * 1000)
    const windowEnd = new Date(targetStart.getTime() + 5 * 60 * 1000)

    const bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: windowStart,
          lte: windowEnd
        },
        status: 'CONFIRMED',
        isPreheating: false,
        resource: {
            type: 'SAUNA'
        }
      },
      include: {
        user: true,
        resource: true
      }
    })

    console.log(`[CRON] Found ${bookings.length} sauna bookings to preheat.`)

    for (const booking of bookings) {
      try {
        // 2. Send Preheat Command
        await iotRelays.toggleSaunaPower(booking.id, 'ON')
        
        // 3. Notify Resident
        await notificationService.sendPush(
            'RESIDENT', // In real app, we'd target specific user token
            'Sauna Lämpenee 🧖',
            `Saunasi alkaa lämmetä nyt. Vuorosi alkaa klo ${booking.startTime.getHours()}:${booking.startTime.getMinutes().toString().padStart(2, '0')}.`
        )

        // Mark as preheating processed (handled in toggleSaunaPower somewhat, but ensuring here)
        // (Actually toggleSaunaPower sets isPreheating=true)

      } catch (err) {
        console.error(`[CRON] Failed to start sauna for booking ${booking.id}`, err)
        // 5. ERROR HANDLING: Refund & Alert
        await notificationService.sendPush('BOARD', 'SAUNA VIKA', `Saunan kytkentä epäonnistui vuorolle ${booking.id}.`)
        // Refund logic would go here (call bookingEngine.cancelBooking with reason?)
      }
    }

    return NextResponse.json({ success: true, processed: bookings.length })
  } catch (error) {
    console.error('[CRON] Sauna start job failed', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
