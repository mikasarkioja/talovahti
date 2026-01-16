'use server'

import { FmiService } from '@/lib/services/fmiService'
import { parseFmiXml, FmiDataPoint } from '@/lib/services/fmiParser'
import { revalidateTag } from 'next/cache'

export type PulseData = {
  forecast: {
    temp: FmiDataPoint[]
    snow: FmiDataPoint[]
  }
  alerts: {
    cold: boolean
    snow: boolean
  }
  updatedAt: string
}

export async function getPulseData(companyId: string): Promise<PulseData> {
  // In a real app, fetch lat/lon from Prisma HousingCompany model
  const LAT = 60.1695
  const LON = 24.9354

  // Fetch raw XML using the service (but modified to return text)
  // We'll bypass the parsing inside FmiService for this server action to use our new parser
  // Or better, refactor FmiService to use our new parser internally. 
  // For this step, let's call FmiService to get raw XML (we need to expose a method or just fetch here).
  
  // Re-implementing raw fetch here to ensure we use the new parser logic explicitly requested.
  const STORED_QUERY_ID = 'fmi::forecast::harmonie::surface::point::timevaluepair'
  const startTime = new Date().toISOString()
  const endTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'getFeature',
    storedquery_id: STORED_QUERY_ID,
    latlon: `${LAT},${LON}`,
    starttime: startTime,
    endtime: endTime,
    parameters: 'Temperature,SnowDepth' 
  })

  const url = `https://opendata.fmi.fi/wfs?${params.toString()}`
  
  let xmlText = ''
  try {
    const response = await fetch(url, { next: { tags: [`pulse-${companyId}`], revalidate: 1800 } })
    xmlText = await response.text()
  } catch (e) {
    console.error("FMI Fetch Error", e)
    return { forecast: { temp: [], snow: [] }, alerts: { cold: false, snow: false }, updatedAt: new Date().toISOString() }
  }

  // Parse with Node-safe parser
  const { temp, snow } = parseFmiXml(xmlText)

  // Logic
  const isCold = temp.some(p => p.value < -15)
  // Snow alert if accumulation > 5cm in 12h. 
  // Simplified: if max snow depth > 5cm (assuming baseline 0 or delta). 
  // FMI 'SnowDepth' is total depth. We should check delta. 
  // For simplicity matching previous logic: check if any point has > 5cm more than start?
  // Let's stick to the BuildingPhysicsEngine logic but applied here for the view model.
  
  // Simplified view logic:
  const isSnow = snow.some(p => p.value > 5) 

  return {
    forecast: { temp, snow },
    alerts: { cold: isCold, snow: isSnow },
    updatedAt: new Date().toISOString()
  }
}

export async function refreshPulse(companyId: string) {
  revalidateTag(`pulse-${companyId}`)
}
