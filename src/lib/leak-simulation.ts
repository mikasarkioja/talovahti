import { prisma } from './db'
import { leakDetection } from './leak-detection'

export const leakSimulation = {
  async simulateLeak(apartmentId: string, type: 'BURST' | 'DRIP' | 'HIGH_USAGE') {
    const now = new Date()
    const points = []

    // Base reading (cumulative)
    let startValue = 1000

    if (type === 'BURST') {
      // Create a spike: Normal -> Normal -> HUGE JUMP
      points.push({ date: new Date(now.getTime() - 1000 * 60 * 60 * 2), value: startValue })
      points.push({ date: new Date(now.getTime() - 1000 * 60 * 60 * 1), value: startValue + 10 }) // Normal 10L usage
      points.push({ date: now, value: startValue + 10 + 600 }) // +600L in 1 hour -> Trigger DEFENDER
    } else if (type === 'DRIP') {
      // Constant small increase
      for (let i = 5; i >= 0; i--) {
        points.push({ 
            date: new Date(now.getTime() - 1000 * 60 * 60 * i), 
            value: startValue + (5 - i) * 5 // 5L/hr constant flow
        }) 
      }
    } else if (type === 'HIGH_USAGE') {
        // Just high usage but maybe not instantaneous burst
         for (let i = 3; i >= 0; i--) {
            points.push({ 
                date: new Date(now.getTime() - 1000 * 60 * 60 * i), 
                value: startValue + (3 - i) * 100 // 100L/hr
            }) 
         }
    }

    // Inject to DB (mocking real IoT write)
    // In a real scenario, we might write these to the Reading table.
    // For this simulation tool, we just pass them to the engine directly to test logic.
    console.log(`Simulating ${type} for ${apartmentId} with ${points.length} points`)
    
    await leakDetection.detectAnomalies(apartmentId, points)
    
    return { success: true, points }
  }
}
