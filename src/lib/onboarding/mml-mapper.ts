import { Prisma } from '@prisma/client'

// Mock Type for MML Response
export interface MMLShareholder {
    yTunnus?: string
    hetu?: string // Highly Sensitive
    fullName: string
    shareStart: number
    shareEnd: number
    apartmentNumber: string
    address: string
    ownershipType: 'INSTITUTIONAL' | 'PRIVATE'
}

export interface MMLApartment {
    apartmentNumber: string
    floor: number
    area: number
    sharesStart: number
    sharesEnd: number
}

export class MMLMapper {
    /**
     * Maps an official MML Shareholder object to a Prisma User CreateInput.
     * WARNING: Handles PII (Name, Hetu/YTunnus). Ensure strictly scoped access.
     */
    static mapShareholderToUser(data: MMLShareholder, housingCompanyId: string): Prisma.UserCreateInput | Prisma.UserUpdateInput {
        // In a real scenario, we might salt/hash the HETU or store it in a separate encrypted vault.
        // For this app, we map to standard fields.
        
        return {
            name: data.fullName,
            email: `placeholder_${data.shareStart}@taloyhtio.fi`, // Email is often missing in MML data, creating placeholder
            role: 'RESIDENT', // Default role, upgraded to OWNER if shares match
            housingCompany: { connect: { id: housingCompanyId } }
        }
    }

    /**
     * Maps MML Apartment data to Prisma Apartment model.
     */
    static mapApartmentToModel(data: MMLApartment, housingCompanyId: string): Prisma.ApartmentCreateInput {
        return {
            housingCompany: { connect: { id: housingCompanyId } },
            apartmentNumber: data.apartmentNumber,
            floor: data.floor,
            area: new Prisma.Decimal(data.area),
            sharesStart: data.sharesStart,
            sharesEnd: data.sharesEnd,
            shareCount: (data.sharesEnd - data.sharesStart) + 1
        }
    }

    /**
     * Utility to identify PII fields for audit logging context.
     */
    static getSensitiveFields(data: MMLShareholder): string[] {
        const sensitive = ['fullName', 'address']
        if (data.hetu) sensitive.push('hetu')
        return sensitive
    }
}
