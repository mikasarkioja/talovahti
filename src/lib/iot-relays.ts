import { prisma } from './db'
import { notificationService } from './notifications'
import { energyTracker } from './energy-tracker'

export const iotRelays = {
  // Mock hardware connection
  async toggleSaunaPower(bookingId: string, status: 'ON' | 'OFF') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { resource: true }
    })

    if (!booking) throw new Error('Booking not found')

    // Simulate Relay Offline (Random 5% chance)
    if (Math.random() < 0.05) {
        // 5. ERROR HANDLING: Relay Offline
        console.error('[IOT] Relay connection timed out (Offline)')
        
        // Alert Board
        await notificationService.sendPush('BOARD', 'SAUNA YHTEYSVIRHE', `Rele ei vastaa. Saunaa ei voitu kytkeä ${status === 'ON' ? 'päälle' : 'pois'}.`)
        
        // Refund if trying to turn ON
        if (status === 'ON') {
             // In real app: call bookingEngine.refund(bookingId)
             // For now just log
             console.log('[REFUND] Triggering automatic refund due to technical failure.')
        }
        
        throw new Error('Relay Offline')
    }

    // SAFETY LOGIC: Check door sensor (Mock)
    const doorClosed = await this.checkDoorSensor(booking.resourceId)
    if (status === 'ON' && !doorClosed) {
      // ... existing safety logic
      console.warn(`[SAFETY] Cannot turn ON sauna ${booking.resourceId}. Door is OPEN.`)
      await notificationService.sendPush('BOARD', 'SAUNA TURVALLISUUSVAROITUS', `Saunaa yritettiin kytkeä päälle, mutta ovi on auki. Varaus ID: ${bookingId}`)
      throw new Error('Safety violation: Door is open.')
    }

    // Send Command to Relay (Mock)
    console.log(`[IOT] Sending ${status} command to Relay for ${booking.resource.name} (Power: ${booking.resource.powerRatingKw}kW)`)
    
    let kwh = 0
    let cost = 0
    let duration = 0

    if (status === 'OFF') {
        // Find last ON event to calculate duration
        const lastOn = await prisma.powerEvent.findFirst({
            where: { bookingId, eventType: 'ON' },
            orderBy: { timestamp: 'desc' }
        })
        
        if (lastOn) {
            const end = new Date()
            duration = (end.getTime() - lastOn.timestamp.getTime()) / (1000 * 60) // minutes
            cost = await energyTracker.calculateSessionCost(booking.resourceId, duration)
            
            // Calculate kWh
            const hours = duration / 60
            kwh = (booking.resource.powerRatingKw || 6) * hours

            // 4. ENERGY TRACKING: Deduct from fund
            await energyTracker.recordConsumption(booking.resource.housingCompanyId, cost, kwh)
        }
    }

    // Log Power Event
    await prisma.powerEvent.create({
      data: {
        resourceId: booking.resourceId,
        bookingId: bookingId,
        eventType: status,
        timestamp: new Date(),
        durationMinutes: duration > 0 ? Math.round(duration) : null,
        kwhEstimated: kwh > 0 ? kwh : null,
        costEstimated: cost > 0 ? cost : null
      }
    })

    // Update Booking State
    if (status === 'ON') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { isPreheating: true } 
      })
    }

    return { success: true, status }
  },

  async checkDoorSensor(resourceId: string): Promise<boolean> {
    // Mock: 99% chance door is closed
    return Math.random() > 0.01
  },

  async getResourceStatus(resourceId: string): Promise<'HEATING' | 'STANDBY' | 'COOLING'> {
    // Mock based on recent events
    const lastEvent = await prisma.powerEvent.findFirst({
        where: { resourceId },
        orderBy: { timestamp: 'desc' }
    })
    
    if (!lastEvent || lastEvent.eventType === 'OFF') return 'STANDBY'
    // If ON was sent > 4h ago, assume cooling/off (safety timeout)
    // For demo, if last event is ON/PREHEAT, it's HEATING
    return 'HEATING'
  },

  async emergencyKillSwitch(housingCompanyId: string) {
    console.log(`[URGENT] KILL SWITCH ACTIVATED for Housing Company ${housingCompanyId}`)
    // In real world: Loop through all active resources and send OFF command
    // Also notify everyone
    await notificationService.sendPush('ALL_RESIDENTS', 'HÄTÄSEIS', 'Taloyhtiön sähkölaitteet on kytketty pois päältä hätätilanteen vuoksi.')
    return { success: true }
  }
}
