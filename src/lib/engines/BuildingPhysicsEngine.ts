import { FmiForecastPoint } from '@/lib/services/fmiService'

export type EnergyImpact = 'NORMAL' | 'WARNING' | 'CRITICAL'
export type MaintenanceAlert = 'NONE' | 'SNOW_REMOVAL' | 'SANDING'

export class BuildingPhysicsEngine {
  /**
   * Calculates the energy impact status based on forecast.
   * @param forecast 48h forecast
   * @returns EnergyImpact status
   */
  static calculateEnergyImpact(forecast: FmiForecastPoint[]): EnergyImpact {
    if (!forecast || forecast.length === 0) return 'NORMAL'

    // Check for drop below -15C at any point
    const minTemp = Math.min(...forecast.map(p => p.temp))
    
    if (minTemp <= -15) return 'CRITICAL'
    if (minTemp <= -10) return 'WARNING'
    
    return 'NORMAL'
  }

  /**
   * Checks for snow removal alerts.
   * Logic: Snow depth increases by > 5cm within any 12h window.
   */
  static checkMaintenanceAlerts(forecast: FmiForecastPoint[]): MaintenanceAlert {
    if (!forecast || forecast.length === 0) return 'NONE'

    // Sliding window of 12 hours (assuming hourly data, 12 points)
    // We'll approximate by checking delta between points separated by ~12h
    
    // Sort just in case
    const sorted = [...forecast].sort((a, b) => a.time.getTime() - b.time.getTime())
    
    for (let i = 0; i < sorted.length; i++) {
        const start = sorted[i]
        // Find point ~12h later
        const endNode = sorted.find(p => p.time.getTime() - start.time.getTime() >= 12 * 3600 * 1000 && p.time.getTime() - start.time.getTime() <= 14 * 3600 * 1000)
        
        if (endNode) {
            const deltaSnow = endNode.snow - start.snow
            if (deltaSnow > 5) return 'SNOW_REMOVAL'
        }
    }

    return 'NONE'
  }
}
