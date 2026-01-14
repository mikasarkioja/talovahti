import { prisma } from '@/lib/db'

export async function syncBuildingIdentity(housingCompanyId: string, yTunnus: string) {
  // 1. Mock MML API Call
  console.log(`[MML Sync] Fetching data for ${yTunnus}...`)
  
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Mock Data: 12 Apartments, 3 Staircases
  const mockApartments = []
  const staircases = ['A', 'B', 'C']
  const floors = 4
  
  let shareIndex = 1
  
  for (const stair of staircases) {
    for (let f = 1; f <= floors; f++) {
      const aptNum = (f - 1) * 3 + (staircases.indexOf(stair) * floors * 3) + 1 // A1, A2...
      // Actually let's just create 3 per floor per stair
      for (let unit = 1; unit <= 3; unit++) {
         const globalNum = ((staircases.indexOf(stair)) * floors * 3) + ((f-1)*3) + unit
         const shareCount = unit === 1 ? 450 : unit === 2 ? 300 : 750 // Different sizes
         
         mockApartments.push({
            apartmentNumber: `${stair} ${globalNum}`,
            floor: f,
            area: unit === 1 ? 45 : unit === 2 ? 30 : 75,
            sharesStart: shareIndex,
            sharesEnd: shareIndex + shareCount - 1,
            shareCount: shareCount
         })
         shareIndex += shareCount
      }
    }
  }

  // 2. DB Transaction
  await prisma.$transaction(async (tx) => {
    // Clear existing? Maybe not for safety. Upsert.
    
    for (const apt of mockApartments) {
        await tx.apartment.upsert({
            where: {
                housingCompanyId_apartmentNumber: {
                    housingCompanyId,
                    apartmentNumber: apt.apartmentNumber
                }
            },
            create: {
                housingCompanyId,
                apartmentNumber: apt.apartmentNumber,
                floor: apt.floor,
                area: apt.area,
                sharesStart: apt.sharesStart,
                sharesEnd: apt.sharesEnd,
                shareCount: apt.shareCount
            },
            update: {
                area: apt.area, // Sync authoritative data
                sharesStart: apt.sharesStart,
                sharesEnd: apt.sharesEnd,
                shareCount: apt.shareCount
            }
        })
    }

    // Log
    await tx.mMLSyncLog.create({
        data: {
            housingCompanyId,
            status: 'SUCCESS',
            recordCount: mockApartments.length
        }
    })
  })

  return { success: true, count: mockApartments.length }
}
