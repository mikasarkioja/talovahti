import { prisma } from './db'
import { BookingStatus, PaymentType } from '@prisma/client'
import { notificationService } from './notifications'

export const bookingEngine = {
  async validateAvailability(resourceId: string, startTime: Date, endTime: Date): Promise<boolean> {
    // Round to nearest 30 mins just in case, though UI should handle this.
    // Overlap check:
    // (StartA <= EndB) and (EndA >= StartB)
    const overlaps = await prisma.booking.findMany({
      where: {
        resourceId,
        status: 'CONFIRMED',
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime }
          }
        ]
      }
    })

    return overlaps.length === 0
  },

  async createBooking(
    userId: string,
    resourceId: string,
    startTime: Date,
    endTime: Date,
    paymentType: PaymentType
  ) {
    const isAvailable = await this.validateAvailability(resourceId, startTime, endTime)
    if (!isAvailable) throw new Error('Selected time slot is not available.')

    const resource = await prisma.resource.findUnique({ where: { id: resourceId } })
    if (!resource) throw new Error('Resource not found')

    // 1. Payment Processing
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    
    if (paymentType === 'KARMA') {
      const wallet = await prisma.wallet.findUnique({ where: { userId } })
      const totalCostKarma = Math.ceil(resource.priceKarma * durationHours)

      if (!wallet || wallet.karmaBalance < totalCostKarma) {
        throw new Error(`Insufficient Karma balance. Required: ${totalCostKarma}, Available: ${wallet?.karmaBalance || 0}`)
      }
      // Deduct Karma
      await prisma.wallet.update({
        where: { userId },
        data: { karmaBalance: { decrement: totalCostKarma } }
      })
    } else {
      // EURO payment logic (Stripe Intent)
      const totalCostEuro = resource.priceEuro * durationHours
      // Mock: Assume successful payment for now
      console.log(`[PAYMENT] Processing ${totalCostEuro} EUR payment for user ${userId} (${durationHours}h)`)
    }

    // 2. Create Booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        resourceId,
        startTime,
        endTime,
        paymentType,
        status: 'CONFIRMED',
        accessCode: this.generateAccessCode()
      }
    })

    // 3. Schedule Notification (Mock)
    // We would insert a job into a queue here.
    // For now, we just log what we would do.
    const notifyTime = new Date(startTime.getTime() - 10 * 60 * 1000) // 10 mins before
    console.log(`[JOB] Scheduled notification for ${notifyTime}: "Your booking starts in 10 mins. PIN: ${booking.accessCode}"`)

    return booking
  },

  async cancelBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { resource: true } })
    if (!booking) throw new Error('Booking not found')
    
    if (booking.status !== 'CONFIRMED') throw new Error('Booking is not active')

    const now = new Date()
    const hoursUntilStart = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    let refundAmount = 0
    let refundType = booking.paymentType

    // Cancellation Policy
    if (hoursUntilStart > 12) {
      // Full Refund
      refundAmount = booking.paymentType === 'KARMA' ? booking.resource.priceKarma : booking.resource.priceEuro
    } else {
      // 50% Refund
      refundAmount = booking.paymentType === 'KARMA' 
        ? Math.floor(booking.resource.priceKarma * 0.5) 
        : booking.resource.priceEuro * 0.5
    }

    // Process Refund
    if (refundAmount > 0) {
      if (refundType === 'KARMA') {
        await prisma.wallet.update({
          where: { userId: booking.userId },
          data: { karmaBalance: { increment: refundAmount as number } }
        })
      } else {
        console.log(`[REFUND] Refunding ${refundAmount} EUR to user ${booking.userId}`)
      }
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    })

    return { success: true, refundAmount, refundType }
  },

  generateAccessCode() {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }
}
