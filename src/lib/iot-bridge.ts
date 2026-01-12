import { MeterType } from '@prisma/client'

export type MockMeterData = {
  serialNumber: string
  type: MeterType
  value: number
  timestamp: Date
}

export const iotBridge = {
  async fetchReadings(provider: 'VERTO' | 'DIGITA' | 'MOCK', apiKey: string): Promise<MockMeterData[]> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 600))

    // Mock data generator
    const now = new Date()
    return [
      {
        serialNumber: 'V-1001-HOT',
        type: 'WATER_HOT',
        value: 1250.5 + Math.random() * 10,
        timestamp: now
      },
      {
        serialNumber: 'V-1001-COLD',
        type: 'WATER_COLD',
        value: 2300.2 + Math.random() * 20,
        timestamp: now
      },
      {
        serialNumber: 'E-5005',
        type: 'ELECTRICITY',
        value: 15000 + Math.random() * 50,
        timestamp: now
      }
    ]
  },

  exportToAccounting(invoices: any[], format: 'SEPA_XML' | 'PROCOUNTOR_CSV' | 'NETVISOR_XML') {
    // In a real implementation, this would generate the file content.
    console.log(`Exporting ${invoices.length} balancing invoices to ${format}`)
    
    return {
      success: true,
      fileUrl: `/api/downloads/billing-export-${Date.now()}.${format === 'PROCOUNTOR_CSV' ? 'csv' : 'xml'}`,
      recordCount: invoices.length
    }
  }
}
