// src/lib/services/mml.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface MMLChangeNotification {
  id: string;
  type: "SHAREHOLDER_UPDATE" | "MORTGAGE_CHANGE" | "RENOVATION_NOTICE";
  apartmentId: string;
  description: string;
  effectiveDate: string;
}

export class MMLClient {
  private static mockNotifications: MMLChangeNotification[] = [
    {
      id: "mml_1",
      type: "SHAREHOLDER_UPDATE",
      apartmentId: "apt_1",
      description: "Uusi osakas rekisteröity: Matti Meikäläinen",
      effectiveDate: new Date().toISOString(),
    },
    {
      id: "mml_2",
      type: "MORTGAGE_CHANGE",
      apartmentId: "apt_2",
      description: "Panttausmerkintä muutettu: Nordea Bank Abp",
      effectiveDate: new Date().toISOString(),
    },
  ];

  /**
   * Simuloi HJT2 (Huoneistotietojärjestelmä) muutosilmoitusten hakua.
   */
  async getPendingNotifications(): Promise<MMLChangeNotification[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MMLClient.mockNotifications;
  }

  /**
   * Synkronoi osakasluettelo HJT2:n kanssa.
   */
  async syncShareholderRegister(housingCompanyId: string, actorId: string) {
    // 1. Audit Log -kirjaus
    await prisma.auditLog.create({
      data: {
        action: "HTJ_SYNC_SHAREHOLDERS",
        userId: actorId,
        metadata: {
          housingCompanyId,
          timestamp: new Date().toISOString(),
          label: "Osakasluettelo synkronoitu",
        },
      },
    });

    // 2. GDPR Log -kirjaus (koska käsitellään henkilötietoja)
    await prisma.gDPRLog.create({
      data: {
        actorId,
        action: "SYNC",
        resource: `HousingCompany:${housingCompanyId}:Shareholders`,
        reason: "Lakisääteinen osakasluettelon ylläpito (HJT2)",
        targetEntity: "Shareholder",
      },
    });

    return { success: true, syncedCount: 12 };
  }

  /**
   * Lähettää muutosilmoituksen HJT2:een.
   */
  async sendChangeNotification(
    housingCompanyId: string,
    actorId: string,
    type: string,
    details: Prisma.InputJsonValue,
  ) {
    await prisma.auditLog.create({
      data: {
        action: "HTJ_CHANGE_NOTIFICATION",
        userId: actorId,
        metadata: {
          housingCompanyId,
          type,
          details,
          label: "HTJ-muutosilmoitus lähetetty",
        } as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

export const mml = new MMLClient();
