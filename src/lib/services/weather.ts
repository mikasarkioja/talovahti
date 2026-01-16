// Mock FMI Weather Service
// In a real app, this would fetch from fmi.fi open data

export type WeatherData = {
  temperature: number
  windSpeed: number
  snowDepth: number // cm
  forecast: {
    day: string
    temp: number
    snow: number
  }[]
  condition: 'CLEAR' | 'CLOUDY' | 'SNOW' | 'RAIN'
}

export async function getLocalWeather(): Promise<WeatherData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock Data (Winter Scenario)
  return {
    temperature: -12,
    windSpeed: 5,
    snowDepth: 15,
    condition: 'SNOW',
    forecast: [
      { day: 'Ma', temp: -12, snow: 2 },
      { day: 'Ti', temp: -18, snow: 0 }, // Cold Front
      { day: 'Ke', temp: -15, snow: 5 }, // Snow Alert potential
      { day: 'To', temp: -8, snow: 10 }, // Heavy Snow
      { day: 'Pe', temp: -5, snow: 2 },
    ]
  }
}
