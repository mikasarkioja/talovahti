import { FmiDataPoint } from "@/lib/services/fmiParser";

export type EnergyImpact = "NORMAL" | "WARNING" | "CRITICAL";
export type MaintenanceAlert =
  | "NONE"
  | "SNOW_REMOVAL"
  | "SANDING"
  | "ROOF_SNOW_WARNING";

export class BuildingPhysicsEngine {
  // A simplified heat loss coefficient for a typical Finnish apartment block
  private static readonly HEAT_LOSS_FACTOR = 0.05;

  /**
   * Calculates energy impact using a "Delta T" approach.
   * Based on the difference between standard indoor temp (21°C) and forecast.
   */
  static calculateEnergyImpact(
    temperatureForecast: FmiDataPoint[],
  ): EnergyImpact {
    if (!temperatureForecast?.length) return "NORMAL";

    const minTemp = Math.min(...temperatureForecast.map((p) => p.value));

    // In Finland, -15°C is a common threshold for "Pakkasraja" logic
    if (minTemp <= -15) return "CRITICAL";
    if (minTemp <= -7) return "WARNING"; // Enhanced: alert earlier for better prep

    return "NORMAL";
  }

  /**
   * Maintenance logic for Finnish winter conditions.
   * Detects both Snowfall (Auraus) and Ice formation (Hiekoitus).
   */
  static checkMaintenanceAlerts(
    snowForecast: FmiDataPoint[],
    tempForecast: FmiDataPoint[],
  ): MaintenanceAlert {
    if (!snowForecast?.length || !tempForecast?.length) return "NONE";

    // 1. Snow Removal Logic: > 5cm accumulation in any 12h window
    const maxSnowDelta = this.calculateMaxDelta(snowForecast, 12);
    if (maxSnowDelta > 5) return "SNOW_REMOVAL";

    // 2. Sanding Logic (Slippery Conditions): Temp crossing 0°C (Freezing/Thawing)
    const hasFreezingCycle = this.detectFreezingCycle(tempForecast);
    if (hasFreezingCycle) return "SANDING";

    // 3. Roof Warning: High accumulation + high wind (simplification)
    if (maxSnowDelta > 15) return "ROOF_SNOW_WARNING";

    return "NONE";
  }

  /**
   * Detects if the temperature crosses the freezing point (0°C).
   * This is the most dangerous state for pedestrian safety in Finland.
   */
  private static detectFreezingCycle(temps: FmiDataPoint[]): boolean {
    for (let i = 1; i < temps.length; i++) {
      const prev = temps[i - 1].value;
      const curr = temps[i].value;
      // If crosses zero from above or below
      if ((prev > 0 && curr <= 0) || (prev <= 0 && curr > 0)) return true;
    }
    return false;
  }

  private static calculateMaxDelta(
    points: FmiDataPoint[],
    hourWindow: number,
  ): number {
    let maxDelta = 0;
    const sorted = [...points].sort(
      (a, b) => a.time.getTime() - b.time.getTime(),
    );

    for (let i = 0; i < sorted.length; i++) {
      const start = sorted[i];
      const windowEnd = new Date(
        start.time.getTime() + hourWindow * 3600 * 1000,
      );

      const endNode = sorted.find((p) => p.time >= windowEnd);
      if (endNode) {
        maxDelta = Math.max(maxDelta, endNode.value - start.value);
      }
    }
    return maxDelta;
  }
}
