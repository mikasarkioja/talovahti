"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getMMLClient } from "@/lib/mml/htj-client";
import { withAuditLogging, extractPIIFields } from "@/lib/mml/audit-wrapper";

/**
 * Sync housing company data from MML HTJ2 API
 *
 * Fetches data from /yhtiot/ and /osakeryhmat/ endpoints,
 * stores raw responses in shadow database, and maps to local models
 * without overwriting user-provided work-in-progress data.
 */
export async function syncHousingCompany(
  businessId: string,
  boardMemberId: string,
) {
  const client = getMMLClient();

  // Find housing company
  const company = await prisma.housingCompany.findUnique({
    where: { businessId },
    include: {
      apartments: true,
      shareholders: true,
    },
  });

  if (!company) {
    throw new Error(`Housing company not found: ${businessId}`);
  }

  // Fetch data from MML with audit logging
  const yhtioResult = await withAuditLogging(
    {
      boardMemberId,
      housingCompanyId: company.id,
      operation: "SYNC_YHTIO",
      piiFieldsAccessed: [],
      metadata: { businessId, endpoint: "/yhtiot/" },
    },
    async () => {
      const data = await client.fetchYhtio(businessId);
      const piiFields = extractPIIFields(data);

      // Store in shadow database
      await prisma.hTJ_ShadowRecord.upsert({
        where: {
          housingCompanyId_endpoint_businessId: {
            housingCompanyId: company.id,
            endpoint: "/yhtiot/",
            businessId,
          },
        },
        create: {
          housingCompanyId: company.id,
          endpoint: "/yhtiot/",
          businessId,
          rawResponse: data as Prisma.InputJsonValue,
          recordType: "YHTIO",
        },
        update: {
          rawResponse: data as Prisma.InputJsonValue,
          syncedAt: new Date(),
        },
      });

      return { data };
    },
  );

  if (!yhtioResult.success) {
    throw new Error(`Failed to sync yhtio: ${yhtioResult.error}`);
  }

  const osakeryhmatResult = await withAuditLogging(
    {
      boardMemberId,
      housingCompanyId: company.id,
      operation: "SYNC_OSAKERYHMAT",
      piiFieldsAccessed: [], // Will be extracted automatically by audit wrapper
      metadata: { businessId, endpoint: "/osakeryhmat/" },
    },
    async () => {
      const data = await client.fetchOsakeryhmat(businessId);

      // Store in shadow database
      await prisma.hTJ_ShadowRecord.upsert({
        where: {
          housingCompanyId_endpoint_businessId: {
            housingCompanyId: company.id,
            endpoint: "/osakeryhmat/",
            businessId,
          },
        },
        create: {
          housingCompanyId: company.id,
          endpoint: "/osakeryhmat/",
          businessId,
          rawResponse: data as Prisma.InputJsonValue,
          recordType: "OSAKERYHMA",
        },
        update: {
          rawResponse: data as Prisma.InputJsonValue,
          syncedAt: new Date(),
        },
      });

      return { data };
    },
  );

  if (!osakeryhmatResult.success) {
    throw new Error(`Failed to sync osakeryhmat: ${osakeryhmatResult.error}`);
  }

  // PII fields are already logged by audit wrapper

  // Map MML data to local models (without overwriting user data)
  const yhtioData = (yhtioResult.data as { data?: unknown })?.data as {
    nimi?: string;
    osoite?: string;
    postinumero?: string;
    postitoimipaikka?: string;
    rakennusvuosi?: number;
    kokonaispintaala?: number;
  };

  const osakeryhmatData = (osakeryhmatResult.data as { data?: unknown })
    ?.data as Array<{
    huoneistonumero: string;
    kerros?: number;
    pintaala?: number;
    osakkeetAlku?: number;
    osakkeetLoppu?: number;
    osakkeidenMaara?: number;
    osakas?: {
      nimi?: string;
      henkilotunnus?: string;
      osoite?: string;
    };
  }>;

  // Update housing company (only if fields are missing or from authoritative source)
  await prisma.housingCompany.update({
    where: { id: company.id },
    data: {
      // Only update if local data is missing
      name: company.name || yhtioData?.nimi || company.name,
      address: company.address || yhtioData?.osoite || company.address,
      postalCode:
        company.postalCode || yhtioData?.postinumero || company.postalCode,
      city: company.city || yhtioData?.postitoimipaikka || company.city,
      constructionYear:
        company.constructionYear ||
        yhtioData?.rakennusvuosi ||
        company.constructionYear,
      totalSqm:
        company.totalSqm || yhtioData?.kokonaispintaala || company.totalSqm,
    },
  });

  // Map apartments (upsert, but preserve user-modified data)
  let apartmentCount = 0;
  if (Array.isArray(osakeryhmatData)) {
    for (const osake of osakeryhmatData) {
      const existingApt = company.apartments.find(
        (apt) => apt.apartmentNumber === osake.huoneistonumero,
      );

      // Only create/update if apartment doesn't exist or has no user modifications
      // Check if apartment has user-provided data (e.g., custom area, modified shares)
      const existingArea = existingApt?.area ? Number(existingApt.area) : null;
      const htjArea = osake.pintaala ? Number(osake.pintaala) : null;
      const hasUserModifications =
        existingApt &&
        ((existingArea !== null && existingArea !== htjArea) ||
          existingApt.sharesStart !== osake.osakkeetAlku ||
          existingApt.sharesEnd !== osake.osakkeetLoppu);

      if (!hasUserModifications) {
        await prisma.apartment.upsert({
          where: {
            housingCompanyId_apartmentNumber: {
              housingCompanyId: company.id,
              apartmentNumber: osake.huoneistonumero,
            },
          },
          create: {
            housingCompanyId: company.id,
            apartmentNumber: osake.huoneistonumero,
            floor: osake.kerros || null,
            area: osake.pintaala ? Number(osake.pintaala) : null,
            sharesStart: osake.osakkeetAlku || 1,
            sharesEnd: osake.osakkeetLoppu || osake.osakkeidenMaara || 1,
            shareCount: osake.osakkeidenMaara || 1,
          },
          update: {
            // Only update if no user modifications detected
            floor: osake.kerros || existingApt?.floor || null,
            area: osake.pintaala
              ? Number(osake.pintaala)
              : existingApt?.area || null,
            sharesStart: osake.osakkeetAlku || existingApt?.sharesStart || 1,
            sharesEnd:
              osake.osakkeetLoppu ||
              existingApt?.sharesEnd ||
              osake.osakkeidenMaara ||
              1,
            shareCount: osake.osakkeidenMaara || existingApt?.shareCount || 1,
          },
        });
        apartmentCount++;
      }
    }
  }

  // Map shareholders (upsert, but preserve user data)
  let shareholderCount = 0;
  if (Array.isArray(osakeryhmatData)) {
    for (const osake of osakeryhmatData) {
      if (osake.osakas) {
        const existingShareholder = company.shareholders.find(
          (sh) =>
            sh.shareCount === osake.osakkeidenMaara &&
            sh.name === osake.osakas?.nimi,
        );

        if (!existingShareholder) {
          await prisma.shareholder.create({
            data: {
              housingCompanyId: company.id,
              name: osake.osakas.nimi || "Unknown",
              businessId: osake.osakas.henkilotunnus || null,
              shareCount: osake.osakkeidenMaara || 1,
              isInstitutional: false, // Default, can be enhanced
            },
          });
          shareholderCount++;
        }
      }
    }
  }

  // Update audit log with record counts
  await prisma.hTJ_SyncLog.updateMany({
    where: {
      housingCompanyId: company.id,
      operation: { in: ["SYNC_YHTIO", "SYNC_OSAKERYHMAT"] },
      timestamp: {
        gte: new Date(Date.now() - 60000), // Last minute
      },
    },
    data: {
      recordCount: apartmentCount + shareholderCount,
    },
  });

  return {
    success: true,
    apartmentsSynced: apartmentCount,
    shareholdersSynced: shareholderCount,
    auditLogIds: [yhtioResult.auditLogId, osakeryhmatResult.auditLogId],
  };
}

/**
 * Compare local database state with HTJ shadow records
 * Returns delta (differences) for compliance audit
 *
 * Wrapped with audit logging for GDPR compliance
 */
export async function compareHTJState(
  businessId: string,
  boardMemberId: string,
) {
  const company = await prisma.housingCompany.findUnique({
    where: { businessId },
    include: {
      apartments: true,
      shareholders: true,
      htjShadowRecords: {
        orderBy: { syncedAt: "desc" },
        take: 2, // Latest yhtio and osakeryhmat records
      },
    },
  });

  if (!company) {
    throw new Error(`Housing company not found: ${businessId}`);
  }

  // Perform comparison with audit logging
  const result = await withAuditLogging(
    {
      boardMemberId,
      housingCompanyId: company.id,
      operation: "COMPARE_DELTA",
      piiFieldsAccessed: [],
      metadata: { businessId },
    },
    async () => {
      const deltas: Array<{
        type: string;
        field: string;
        localValue: unknown;
        htjValue: unknown;
        status: "MISMATCH" | "MISSING_LOCAL" | "MISSING_HTJ";
      }> = [];

      // Compare housing company data
      const yhtioRecord = company.htjShadowRecords.find(
        (r) => r.recordType === "YHTIO",
      );
      if (yhtioRecord) {
        const htjData = yhtioRecord.rawResponse as {
          nimi?: string;
          osoite?: string;
          postinumero?: string;
          postitoimipaikka?: string;
          rakennusvuosi?: number;
          kokonaispintaala?: number;
        };

        // Compare fields
        if (htjData.nimi && company.name !== htjData.nimi) {
          deltas.push({
            type: "HOUSING_COMPANY",
            field: "name",
            localValue: company.name,
            htjValue: htjData.nimi,
            status: "MISMATCH",
          });
        }

        if (
          htjData.rakennusvuosi &&
          company.constructionYear !== htjData.rakennusvuosi
        ) {
          deltas.push({
            type: "HOUSING_COMPANY",
            field: "constructionYear",
            localValue: company.constructionYear,
            htjValue: htjData.rakennusvuosi,
            status: "MISMATCH",
          });
        }

        if (
          htjData.kokonaispintaala &&
          company.totalSqm !== htjData.kokonaispintaala
        ) {
          deltas.push({
            type: "HOUSING_COMPANY",
            field: "totalSqm",
            localValue: company.totalSqm,
            htjValue: htjData.kokonaispintaala,
            status: "MISMATCH",
          });
        }
      }

      // Compare apartments
      const osakeryhmatRecord = company.htjShadowRecords.find(
        (r) => r.recordType === "OSAKERYHMA",
      );
      if (osakeryhmatRecord) {
        const htjApartments = osakeryhmatRecord.rawResponse as Array<{
          huoneistonumero: string;
          pintaala?: number;
          osakkeidenMaara?: number;
        }>;

        if (Array.isArray(htjApartments)) {
          for (const htjApt of htjApartments) {
            const localApt = company.apartments.find(
              (apt) => apt.apartmentNumber === htjApt.huoneistonumero,
            );

            if (!localApt) {
              deltas.push({
                type: "APARTMENT",
                field: "apartmentNumber",
                localValue: null,
                htjValue: htjApt.huoneistonumero,
                status: "MISSING_LOCAL",
              });
            } else {
              if (
                htjApt.pintaala &&
                localApt.area !== null &&
                Number(localApt.area) !== Number(htjApt.pintaala)
              ) {
                deltas.push({
                  type: "APARTMENT",
                  field: "area",
                  localValue: localApt.area,
                  htjValue: htjApt.pintaala,
                  status: "MISMATCH",
                });
              }
            }
          }

          // Check for apartments in local DB but not in HTJ
          for (const localApt of company.apartments) {
            const htjApt = htjApartments.find(
              (apt) => apt.huoneistonumero === localApt.apartmentNumber,
            );
            if (!htjApt) {
              deltas.push({
                type: "APARTMENT",
                field: "apartmentNumber",
                localValue: localApt.apartmentNumber,
                htjValue: null,
                status: "MISSING_HTJ",
              });
            }
          }
        }
      }

      return {
        businessId,
        housingCompanyId: company.id,
        deltas,
        deltaCount: deltas.length,
        lastSync: osakeryhmatRecord?.syncedAt || yhtioRecord?.syncedAt,
      };
    },
  );

  if (!result.success) {
    throw new Error(`Failed to compare HTJ state: ${result.error}`);
  }

  return result.data;
}

/**
 * Submit renovation notification to MML HTJ2 API
 * Mandatory for renovations completed/planned in 2026+
 */
export async function submitRenovationToHTJ(
  renovationId: string,
  boardMemberId: string,
) {
  const client = getMMLClient();

  // Fetch renovation data
  const renovation = await prisma.renovation.findUnique({
    where: { id: renovationId },
    include: {
      housingCompany: true,
    },
  });

  if (!renovation) {
    throw new Error(`Renovation not found: ${renovationId}`);
  }

  // Check if submission is mandatory (2026+)
  const currentYear = new Date().getFullYear();
  const renovationYear =
    renovation.yearDone || renovation.plannedYear || currentYear;
  const isMandatory = renovationYear >= 2026;

  if (!isMandatory) {
    return {
      success: false,
      message: "Renovation submission not mandatory for years before 2026",
    };
  }

  // Submit with audit logging
  const result = await withAuditLogging(
    {
      boardMemberId,
      housingCompanyId: renovation.housingCompanyId,
      operation: "SUBMIT_RENOVATION",
      piiFieldsAccessed: [], // Renovations typically don't contain PII
      metadata: {
        renovationId,
        businessId: renovation.housingCompany.businessId,
        endpoint: "/ilmoitukset/kunnossapito",
      },
    },
    async () => {
      const response = await client.submitRenovation(
        renovation.housingCompany.businessId,
        {
          component: renovation.component,
          yearDone: renovation.yearDone || undefined,
          plannedYear: renovation.plannedYear || undefined,
          cost: renovation.cost || 0,
          description: renovation.description || undefined,
        },
      );

      // Store submission in shadow database
      await prisma.hTJ_ShadowRecord.create({
        data: {
          housingCompanyId: renovation.housingCompanyId,
          endpoint: "/ilmoitukset/kunnossapito",
          businessId: renovation.housingCompany.businessId,
          rawResponse: response as Prisma.InputJsonValue,
          recordType: "ILMOITUS",
        },
      });

      return response;
    },
  );

  if (!result.success) {
    throw new Error(`Failed to submit renovation: ${result.error}`);
  }

  return {
    success: true,
    auditLogId: result.auditLogId,
    submissionId: (result.data as { id?: string })?.id,
  };
}
