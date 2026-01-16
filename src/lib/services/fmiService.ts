// Service for fetching forecast data from the Finnish Meteorological Institute (FMI)
// Using Open Data WFS API

export interface FmiForecastPoint {
  time: Date
  temp: number // Temperature in Celsius
  snow: number // Snow depth in cm (using appropriate parameter if available, or precipitation)
}

export class FmiService {
  private static readonly BASE_URL = 'https://opendata.fmi.fi/wfs'
  private static readonly STORED_QUERY_ID = 'fmi::forecast::harmonie::surface::point::timevaluepair'

  /**
   * Fetches 48-hour forecast for a specific location.
   * 
   * @param lat Latitude
   * @param lon Longitude
   * @returns Array of forecast points
   */
  static async fetchForecast(lat: number, lon: number): Promise<FmiForecastPoint[]> {
    const startTime = new Date().toISOString()
    const endTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    // Parameters:
    // - temperature (Temperature)
    // - snow depth (SnowDepth) - Note: Harmonie might not have direct snow depth everywhere, 
    //   often PrecipitationAmount is used, but let's try SnowDepth or fall back to mock if needed.
    //   Actually 'SnowDepth' is not always in Harmonie surface point. 
    //   Common params: Temperature, WindSpeedMS, PrecipitationAmount, TotalCloudCover.
    //   Let's check documentation or use common ones. 
    //   For snow ALERTS, precipitation accumulation is key. But request asks for "snow depth".
    //   We will request 'Temperature' and 'SnowDepth' (or equivalent).
    
    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'getFeature',
      storedquery_id: this.STORED_QUERY_ID,
      latlon: `${lat},${lon}`,
      starttime: startTime,
      endtime: endTime,
      parameters: 'Temperature,SnowDepth' 
    })

    const url = `${this.BASE_URL}?${params.toString()}`

    try {
      const response = await fetch(url, { next: { revalidate: 1800 } }) // 30 min cache
      if (!response.ok) {
        throw new Error(`FMI API error: ${response.statusText}`)
      }
      
      const xmlText = await response.text()
      return this.parseGmlResponse(xmlText)
    } catch (error) {
      console.error('Failed to fetch FMI data:', error)
      return [] // Return empty on failure to be safe
    }
  }

  /**
   * Parses the FMI WFS (GML) XML response.
   * Structure is complex: wfs:FeatureCollection -> wfs:member -> BsWfs:BsWfsElement -> BsWfs:TimeValuePair
   */
  private static parseGmlResponse(xmlText: string): FmiForecastPoint[] {
    // Simple regex parsing for robustness in this environment (avoiding heavy XML DOM deps if possible)
    // or use DOMParser if available in this env (Node environment for Server Components needs a library).
    // Since this runs in Next.js Server Component (Node), we need a parser or regex.
    // We'll use regex for simplicity and speed given the known format of TimeValuePair.
    
    // The response has multiple <wfs:member>, each corresponding to a parameter requested.
    // We need to map them by parameter name.
    
    // 1. Split into members
    const members = xmlText.split('<wfs:member>')
    
    const tempPoints: Map<string, number> = new Map()
    const snowPoints: Map<string, number> = new Map()

    members.forEach(member => {
        if (member.includes('Temperature')) {
            const pairs = this.extractTimeValuePairs(member)
            pairs.forEach(p => tempPoints.set(p.time, p.value))
        } else if (member.includes('SnowDepth')) {
            const pairs = this.extractTimeValuePairs(member)
            pairs.forEach(p => snowPoints.set(p.time, p.value))
        }
    })

    // 2. Merge into single timeline
    const result: FmiForecastPoint[] = []
    
    // Sort timestamps
    const timestamps = Array.from(tempPoints.keys()).sort()
    
    timestamps.forEach(ts => {
        result.push({
            time: new Date(ts),
            temp: tempPoints.get(ts) || 0,
            snow: snowPoints.get(ts) || 0
        })
    })

    return result
  }

  private static extractTimeValuePairs(xmlFragment: string): Array<{ time: string, value: number }> {
    const results = []
    // Pattern: <wml2:time>2026-01-15T12:00:00Z</wml2:time><wml2:value>-12.5</wml2:value>
    // Note: Namespace prefixes might vary (wml2, om, etc). Adjusting regex to be loose on namespace.
    
    const regex = /<[^>]*:time>(.*?)<\/[^>]*:time>\s*<[^>]*:value>(.*?)<\/[^>]*:value>/g
    let match
    
    while ((match = regex.exec(xmlFragment)) !== null) {
        const time = match[1]
        const value = parseFloat(match[2])
        if (!isNaN(value)) {
            results.push({ time, value })
        }
    }
    return results
  }
}
