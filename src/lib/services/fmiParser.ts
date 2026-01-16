import { XMLParser } from 'fast-xml-parser'

export interface FmiDataPoint {
  time: Date
  value: number
}

export function parseFmiXml(xmlData: string): { temp: FmiDataPoint[], snow: FmiDataPoint[] } {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    removeNSPrefix: true,
    isArray: (name) => {
      return ['member', 'TimeValuePair'].includes(name)
    }
  })

  const result = parser.parse(xmlData)
  
  // Navigate GML structure: FeatureCollection > member > OM_Observation
  const members = result?.FeatureCollection?.member || []
  
  const tempData: FmiDataPoint[] = []
  const snowData: FmiDataPoint[] = []

  members.forEach((member: any) => {
    const observation = member.OM_Observation
    if (!observation) return

    const parameterName = observation.observedProperty?.title || ''
    
    // Extract time-value pairs
    const pairs = observation.result?.MeasurementTimeseries?.point?.TimeValuePair || []
    
    const parsedPoints = pairs.map((p: any) => ({
      time: new Date(p.time),
      value: parseFloat(p.value)
    })).filter((p: { time: Date; value: number; }) => !isNaN(p.value))

    // Map based on parameter name (t2m = temperature, snow_aws = snow depth)
    // Note: FMI parameter names might vary slightly in WFS 2.0 vs legacy.
    // Checking strict matches or known aliases.
    
    if (parameterName === 'Temperature' || parameterName.includes('t2m')) {
      tempData.push(...parsedPoints)
    } else if (parameterName === 'SnowDepth' || parameterName.includes('snow')) {
      snowData.push(...parsedPoints)
    }
  })

  return { 
    temp: tempData.sort((a, b) => a.time.getTime() - b.time.getTime()),
    snow: snowData.sort((a, b) => a.time.getTime() - b.time.getTime())
  }
}
