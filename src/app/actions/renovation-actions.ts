// src/app/actions/renovation-actions.ts
"use server";

import { prisma } from "@/lib/db";
import {
  RenovationCategory,
  RenovationTriageStatus,
  RenovationStatus,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { RBAC } from "@/lib/auth/rbac";
import { mml } from "@/lib/services/mml";

export async function createRenovationNotificationAction(params: {
  userId: string;
  housingCompanyId: string;
  component: string;
  description: string;
  category: RenovationCategory;
  contractorInfo: string;
  schedule: string;
}) {
  try {
    const {
      userId,
      housingCompanyId,
      component,
      description,
      category,
      contractorInfo,
      schedule,
    } = params;

    // 1. Automated Triage Logic (AI-ready)
    let triageStatus: RenovationTriageStatus = RenovationTriageStatus.PENDING;
    let aiAssessment = "AI analysoi ilmoitusta...";

    if (
      category === RenovationCategory.LVI ||
      category === RenovationCategory.STRUCTURAL
    ) {
      triageStatus = RenovationTriageStatus.REQUIRES_EXPERT;
      aiAssessment = `HUOM: ${category} -työt vaativat aina taloyhtiön valvojan tarkastuksen. Tekniset riskit (vuoto/kantavuus) on huomioitava.`;
    } else if (category === RenovationCategory.SURFACE) {
      triageStatus = RenovationTriageStatus.AUTO_APPROVE_READY;
      aiAssessment =
        "Pintaremointi (maalaus/tapetointi) on yleensä vapaasti sallittua. Voidaan hyväksyä automaattisesti.";
    } else {
      aiAssessment = "Ilmoitus vaatii hallituksen rutiinitarkastuksen.";
    }

    // 2. Create Renovation Record
    const renovation = await prisma.renovation.create({
      data: {
        userId,
        housingCompanyId,
        component,
        description,
        category,
        contractorInfo,
        schedule,
        triageStatus,
        aiAssessment,
        status: RenovationStatus.PENDING,
      },
    });

    // 3. GDPR Logging
    await RBAC.auditAccess(
      userId,
      "WRITE",
      `Renovation:${renovation.id}`,
      "Osakas päivitti muutostyöilmoitustaan",
    );

    revalidatePath("/resident/renovations");
    revalidatePath("/admin/dashboard");

    return { success: true, renovation };
  } catch (error) {
    console.error("Create Renovation Notification Error:", error);
    return {
      success: false,
      error: "Muutostyöilmoituksen jättäminen epäonnistui.",
    };
  }
}

export async function approveRenovationAction(
  renovationId: string,
  actorId: string,
) {
  try {
    const renovation = await prisma.renovation.findUnique({
      where: { id: renovationId },
      include: { user: true },
    });

    if (!renovation) throw new Error("Renovation not found");

    // 1. Update Status
    const updated = await prisma.renovation.update({
      where: { id: renovationId },
      data: {
        triageStatus: RenovationTriageStatus.APPROVED,
        status: RenovationStatus.PLANNED,
      },
    });

    // 2. Sync to HTJ (HJT2)
    await syncRenovationToHTJ(renovationId, actorId);

    // 3. Audit Log
    await prisma.auditLog.create({
      data: {
        action: "RENOVATION_APPROVED",
        userId: actorId,
        targetId: renovationId,
        metadata: {
          label: "Muutostyöilmoitus hyväksytty",
          syncedToHTJ: true,
        } as Prisma.InputJsonValue,
      },
    });

    // 4. Reward Board XP (+50 XP)
    await prisma.boardProfile.upsert({
      where: { housingCompanyId: renovation.housingCompanyId },
      create: {
        housingCompanyId: renovation.housingCompanyId,
        totalXP: 50,
        level: 1,
        achievements: [
          {
            slug: "statutory-supervision",
            name: "Lakisääteinen valvonta",
            description:
              "Hallitus on hyväksynyt osakkaan muutostyöilmoituksen ja synkronoinut sen HJT2-järjestelmään.",
            date: new Date(),
          },
        ] as unknown as Prisma.InputJsonValue,
      },
      update: {
        totalXP: { increment: 50 },
        achievements: {
          push: {
            slug: "statutory-supervision",
            name: "Lakisääteinen valvonta",
            description:
              "Hallitus on hyväksynyt osakkaan muutostyöilmoituksen ja synkronoinut sen HJT2-järjestelmään.",
            date: new Date(),
          },
        } as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, renovation: updated };
  } catch (error) {
    console.error("Approve Renovation Error:", error);
    return { success: false, error: "Muutostyön hyväksyntä epäonnistui." };
  }
}

export async function rejectRenovationAction(
  renovationId: string,
  actorId: string,
  reason: string,
) {
  try {
    const updated = await prisma.renovation.update({
      where: { id: renovationId },
      data: {
        triageStatus: RenovationTriageStatus.REJECTED,
        aiAssessment: `HALLITUKSEN PÄÄTÖS: Hylätty. Syy: ${reason}`,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: "RENOVATION_REJECTED",
        userId: actorId,
        targetId: renovationId,
        metadata: {
          label: "Muutostyöilmoitus hylätty",
          reason,
        } as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/resident/renovations");
    return { success: true, renovation: updated };
  } catch (error) {
    console.error("Reject Renovation Error:", error);
    return { success: false, error: "Muutostyön hylkääminen epäonnistui." };
  }
}

export async function syncRenovationToHTJ(
  renovationId: string,
  actorId: string,
) {
  const renovation = await prisma.renovation.findUnique({
    where: { id: renovationId },
    include: { housingCompany: true },
  });

  if (!renovation) throw new Error("Renovation not found");

  const details = {
    renovationId: renovation.id,
    component: renovation.component,
    category: renovation.category,
    schedule: renovation.schedule,
    contractor: renovation.contractorInfo,
  };

  return await mml.sendChangeNotification(
    renovation.housingCompanyId,
    actorId,
    "RENOVATION_NOTICE",
    details,
  );
}
