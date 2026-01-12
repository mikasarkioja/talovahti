import { prisma } from './db'
import { LeakSeverity, LeakTrigger, LeakStatus, MeterType } from '@prisma/client'

// Mock notification service
const notificationService = {
  sendPush: async (recipient: 'RESIDENT' | 'BOARD' | 'MAINTENANCE', title: string, message: string) => {
    console.log(`[PUSH to ${recipient}] ${title}: ${message}`)
    // In real app: Push to Expo / Firebase / Email
  }
}

interface ReadingPoint {
  date: Date
  value: number
}

export const leakDetection = {
  async detectAnomalies(apartmentId: string, timeSeriesData: ReadingPoint[]) {
    // Sort data by date just in case
    const sortedData = [...timeSeriesData].sort((a, b) => a.date.getTime() - b.date.getTime())
    
    // We need at least a few points to detect anything useful
    if (sortedData.length < 2) return

    const latest = sortedData[sortedData.length - 1]
    const previous = sortedData[sortedData.length - 2]
    
    // Calculate instantaneous flow (e.g., liters per hour if data is hourly)
    const timeDiffHours = (latest.date.getTime() - previous.date.getTime()) / (1000 * 60 * 60)
    const flowDiff = latest.value - previous.value
    const hourlyFlowRate = timeDiffHours > 0 ? flowDiff / timeDiffHours : 0

    // 1. DEFENDER GUARD: Instantaneous Flow Spike (Pipe Burst)
    // Threshold: > 500 liters/hour (example)
    if (hourlyFlowRate > 500) {
      await this.createAlert(apartmentId, 'HIGH', 'DEFENDER', {
        reason: 'Instantaneous flow spike detected',
        flowRate: hourlyFlowRate,
        threshold: 500
      })
    }

    // 2. SENTINEL GUARD: Non-Zero Minimums (Silent Leaks)
    // Check last 2 hours (approx 2 points if hourly, or more if granular)
    // Logic: If flow never drops to 0 in a 2-hour window (usually 2-4am is best check, but here we check window)
    // Simplified: If the minimum flow rate in the last X points is > 0.
    const recentWindow = sortedData.slice(-5) // Last 5 points
    const minFlow = Math.min(...recentWindow.map((pt, i, arr) => {
        if (i === 0) return 99999 // skip first delta
        const dTime = (pt.date.getTime() - arr[i-1].date.getTime()) / (1000 * 60 * 60)
        return dTime > 0 ? (pt.value - arr[i-1].value) / dTime : 99999
    }).filter(v => v !== 99999))

    // If minimum flow never dropped below 2 L/h, it might be a leak
    if (minFlow > 2.0 && recentWindow.length >= 3) {
         await this.createAlert(apartmentId, 'LOW', 'SENTINEL', {
            reason: 'Continuous flow detected (Non-Zero Minimum)',
            minFlowRate: minFlow,
            threshold: 2.0
         })
    }

    // 3. GUARDIAN GUARD: Volume vs 30-day Average (Human Error / Appliance)
    // Compare daily consumption estimate vs 30d avg
    // This requires fetching historical data, which we might not have in `timeSeriesData` argument.
    // For now, let's assume `timeSeriesData` contains enough history or we fetch it.
    // We'll skip complex historical fetch here to keep it focused, or do a simple check on the passed data if it covers 30 days.
    
    // Let's do a simplified check: If current daily projection > 2x average
    // Implementation skipped for brevity unless user provides full 30d history in arg.
  },

  async createAlert(apartmentId: string, severity: LeakSeverity, trigger: LeakTrigger, metadata: any) {
    // Check if there is already an active alert for this apartment & trigger to avoid spam
    const existing = await prisma.leakAlert.findFirst({
      where: {
        apartmentId,
        status: 'ACTIVE',
        triggeredBy: trigger
      }
    })

    if (existing) {
        // Update timestamp or metadata?
        return
    }

    // Create Alert
    const alert = await prisma.leakAlert.create({
      data: {
        apartmentId,
        severity,
        triggeredBy: trigger,
        detectionMetadata: JSON.stringify(metadata),
        status: 'ACTIVE'
      }
    })

    // Routing Logic
    if (severity === 'HIGH') {
      await notificationService.sendPush('RESIDENT', 'KRITINEN VESIVUOTO HAVAITTU', 'Asunnossasi on havaittu suuri vuoto. Sulje vesi heti.')
      await notificationService.sendPush('BOARD', 'VESIVUOTO HÄLYTYS', `Asunnossa ${apartmentId} havaittu suuri vuoto.`)
      // await notificationService.sendPush('MAINTENANCE', ...)
    } else {
      await notificationService.sendPush('RESIDENT', 'Poikkeava vedenkulutus', 'Olemme havainneet pientä jatkuvaa kulutusta. Tarkista vesikalusteet.')
      // 24h escalation logic would be a scheduled job (cron), not here.
    }
    
    return alert
  }
}
