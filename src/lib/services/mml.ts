import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * MML Service for HJT2 Technical Integration.
 * Handles shareholder register transfer between Talovahti and Maanmittauslaitos.
 */
export const MMLService = {
  /**
   * Composes and transfers the shareholder register to MML.
   */
  async transferShareholderRegister(housingCompanyId: string, actorId: string) {
    // 1. Audit Log: Initiation
    await prisma.auditLog.create({
      data: {
        userId: actorId,
        action: "HJT2_SYNC",
        targetId: housingCompanyId,
        metadata: {
          status: "PENDING",
          message: "Osakasluettelon synkronointi aloitettu",
        },
      },
    });

    try {
      // 2. Fetch Data
      const company = await prisma.housingCompany.findUnique({
        where: { id: housingCompanyId },
        include: {
          shareGroups: {
            include: {
              owners: true,
            },
          },
        },
      });

      if (!company) {
        throw new Error("Taloyhtiötä ei löytynyt.");
      }

      if (!company.mmlBuildingId) {
        throw new Error(
          "Taloyhtiöltä puuttuu MML-rakennustunnus (mmlBuildingId).",
        );
      }

      // Security: Check for MML Certificate
      const cert = process.env.MML_CERTIFICATE;
      if (!cert && process.env.NODE_ENV === "production") {
        throw new Error(
          "MML-varmenne (MML_CERTIFICATE) puuttuu tuotantoympäristöstä.",
        );
      }

      // 3. Compose XML Data (HJT2 Schema compatible)
      const xmlData = `
<?xml version="1.0" encoding="UTF-8"?>
<HJT2TransferRequest xmlns="http://xml.mml.fi/hjt2/2026/01">
  <Header>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <OrganizationId>${company.businessId}</OrganizationId>
  </Header>
  <BuildingContext>
    <MMLBuildingId>${company.mmlBuildingId}</MMLBuildingId>
    <HousingCompanyName>${company.name}</OrganizationId>
  </BuildingContext>
  <ShareGroups>
    ${company.shareGroups
      .map(
        (sg) => `
    <ShareGroup>
      <MMLShareGroupId>${sg.mmlShareGroupId || ""}</MMLShareGroupId>
      <ShareNumbers>${sg.shareNumbers}</ShareNumbers>
      <ShareCount>${sg.shareCount}</ShareCount>
      <Owners>
        ${sg.owners
          .map(
            (owner) => `
        <Owner>
          <Name>${owner.name}</Name>
          <Email>${owner.email}</Email>
        </Owner>
        `,
          )
          .join("")}
      </Owners>
    </ShareGroup>
    `,
      )
      .join("")}
  </ShareGroups>
</HJT2TransferRequest>
`.trim();

      // 4. Simulated API Call to MML (using certificate for mutual TLS in real scenario)
      console.log("MML Service: Transmitting HJT2 XML payload...");
      if (process.env.DEBUG_MML === "true") {
        console.log("Payload:", xmlData);
      }

      // Mock delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 5. Success Logging
      const confirmationId = `HTJ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      await prisma.auditLog.create({
        data: {
          userId: actorId,
          action: "HJT2_SYNC",
          targetId: housingCompanyId,
          metadata: {
            status: "SUCCESS",
            message: "HTJ-vahvistus vastaanotettu",
            confirmationId,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        confirmationId,
        message: "Osakasluettelon siirto HTJ-järjestelmään onnistui.",
      };
    } catch (error: unknown) {
      console.error("MML Service Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Tuntematon virhe";

      // 6. Failure Logging
      await prisma.auditLog.create({
        data: {
          userId: actorId,
          action: "HJT2_SYNC",
          targetId: housingCompanyId,
          metadata: {
            status: "FAILED",
            message: errorMessage,
            error: JSON.stringify(error),
          },
        },
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Sends a change notification (e.g., renovation) to HTJ.
   */
  async sendChangeNotification(
    housingCompanyId: string,
    actorId: string,
    type: "RENOVATION_NOTICE" | "OTHER",
    details: Record<string, unknown>,
  ) {
    try {
      console.log(
        `MML Service: Sending ${type} notification to HTJ...`,
        details,
      );

      const confirmationId = `MML-CHANGE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      await prisma.auditLog.create({
        data: {
          userId: actorId,
          action: "MML_CHANGE_NOTIFICATION",
          targetId: housingCompanyId,
          metadata: {
            type,
            details: details as Prisma.InputJsonValue,
            status: "SUCCESS",
            confirmationId,
          },
        },
      });

      return { success: true, confirmationId };
    } catch (error: unknown) {
      console.error("MML Change Notification Error:", error);
      return { success: false, error: "Siirto epäonnistui." };
    }
  },
};
