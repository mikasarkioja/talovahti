import { MMLMapper, MMLShareholder, MMLApartment } from '@/lib/onboarding/mml-mapper'

export interface MMLCompanyData {
    basicInfo: {
        name: string
        yTunnus: string
        constructionYear: number
        address: string
        city: string
        postalCode: string
    }
    apartments: MMLApartment[]
    shareholders: MMLShareholder[]
}

export class MMLClient {
    /**
     * Mocks fetching data from HTJ (Huoneistotietojärjestelmä)
     */
    static async fetchCompanyStructure(yTunnus: string): Promise<MMLCompanyData> {
        console.log(`[MML] Fetching structure for ${yTunnus}...`)
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network latency

        // Mock Data: Large East Helsinki building (1960s)
        const floors = 8
        const staircases = ['A', 'B', 'C', 'D']
        const apartments: MMLApartment[] = []
        const shareholders: MMLShareholder[] = []

        let shareIndex = 1

        for (const stair of staircases) {
            for (let f = 1; f <= floors; f++) {
                // 3 apartments per floor
                for (let i = 1; i <= 3; i++) {
                    const aptNum = (f - 1) * 3 + i
                    const globalNum = `${stair}${aptNum + ((f-1)*10)}` // simplified numbering
                    const area = i === 1 ? 75.5 : i === 2 ? 45.0 : 58.5
                    const shareCount = Math.floor(area * 10)
                    
                    const apt: MMLApartment = {
                        apartmentNumber: `${stair} ${((f-1)*3)+i}`, // e.g. A 1, A 2
                        floor: f,
                        area: area,
                        sharesStart: shareIndex,
                        sharesEnd: shareIndex + shareCount - 1
                    }
                    apartments.push(apt)

                    // Mock Shareholder
                    shareholders.push({
                        fullName: Math.random() > 0.8 ? 'Helsingin Kaupunki' : `Osakas ${stair}${((f-1)*3)+i}`,
                        shareStart: shareIndex,
                        shareEnd: shareIndex + shareCount - 1,
                        apartmentNumber: apt.apartmentNumber,
                        address: `Mellunmäentie 12 ${stair} ${((f-1)*3)+i}`,
                        ownershipType: Math.random() > 0.8 ? 'INSTITUTIONAL' : 'PRIVATE'
                    })

                    shareIndex += shareCount
                }
            }
        }

        return {
            basicInfo: {
                name: 'As Oy Mellunmäen Huippu',
                yTunnus: yTunnus,
                constructionYear: 1968,
                address: 'Mellunmäentie 12',
                city: 'Helsinki',
                postalCode: '00970'
            },
            apartments,
            shareholders
        }
    }

    /**
     * Mocks Suomi.fi / PRH Role Verification
     */
    static async verifyBoardMemberRole(ssn: string, yTunnus: string): Promise<boolean> {
        console.log(`[PRH] Verifying role for ${ssn} in ${yTunnus}...`)
        await new Promise(resolve => setTimeout(resolve, 1500))
        // Always return true for demo
        return true
    }
}
