import { prisma } from "@/lib/db";
import { MMLCompanyData } from "@/lib/mml/client";
import { Prisma } from "@prisma/client";

export class SyncService {
  static async initializeDatabaseFromMML(
    data: MMLCompanyData,
    actorId: string,
  ) {
    console.log(`[Sync] Starting MML ingestion for ${data.basicInfo.yTunnus}`);
    const startTime = Date.now();

    // Use transaction for integrity
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Create Housing Company
        const company = await tx.housingCompany.create({
          data: {
            name: data.basicInfo.name,
            businessId: data.basicInfo.yTunnus,
            address: data.basicInfo.address,
            city: data.basicInfo.city,
            postalCode: data.basicInfo.postalCode,
            constructionYear: data.basicInfo.constructionYear,
          },
        });

        // 2. Bulk Insert Apartments
        // Prisma createMany is faster but doesn't return IDs in all drivers.
        // We use createMany for speed here as we don't need immediate IDs for linking if we link by logic.
        const apartmentData = data.apartments.map((apt) => ({
          housingCompanyId: company.id,
          apartmentNumber: apt.apartmentNumber,
          floor: apt.floor,
          area: new Prisma.Decimal(apt.area),
          sharesStart: apt.sharesStart,
          sharesEnd: apt.sharesEnd,
          shareCount: apt.sharesEnd - apt.sharesStart + 1,
          attributes: { isMMLVerified: true },
          waterFeeAdvance: 20, // Default mock
          elecFeeAdvance: 0,
        }));

        await tx.apartment.createMany({
          data: apartmentData,
        });

        // 3. Bulk Insert Shareholders
        const shareholderData = data.shareholders.map((sh) => ({
          housingCompanyId: company.id,
          name: sh.fullName,
          shareCount: sh.shareEnd - sh.shareStart + 1,
          isInstitutional: sh.ownershipType === "INSTITUTIONAL",
          // Cannot strictly link to Apartment ID here without fetching them back.
          // But in this domain model, matching happens via share numbers.
        }));

        await tx.shareholder.createMany({
          data: shareholderData,
        });

        // 4. Audit Log
        await tx.gDPRLog.create({
          data: {
            actorId: actorId,
            action: "WRITE",
            resource: `HousingCompany:${company.id}`,
            reason: "MML_SYNC_INIT",
            details: `Ingested ${apartmentData.length} apartments and ${shareholderData.length} shareholders.`,
            housingCompanyId: company.id,
          },
        });

        // 5. MML Sync Log
        await tx.mMLSyncLog.create({
          data: {
            housingCompanyId: company.id,
            status: "SUCCESS",
            recordCount: apartmentData.length + shareholderData.length,
          },
        });

        return company;
      },
      {
        maxWait: 10000, // Wait longer for connection
        timeout: 20000, // Allow longer execution
      },
    );

    console.log(`[Sync] Completed in ${Date.now() - startTime}ms`);
    return result;
  }
}
