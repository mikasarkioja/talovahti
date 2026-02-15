// src/app/actions/mml-actions.ts
"use server";

import { mml } from "@/lib/services/mml";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function syncShareholdersAction(
  housingCompanyId: string,
  actorId: string,
) {
  try {
    const result = await mml.syncShareholderRegister(housingCompanyId, actorId);
    revalidatePath("/admin/dashboard");
    return { success: true, result };
  } catch (error) {
    console.error("HJT2 Sync Error:", error);
    return { success: false, error: "HJT2-synkronointi epäonnistui." };
  }
}

export async function sendHTJNotificationAction(
  housingCompanyId: string,
  actorId: string,
  type: string,
  details: Prisma.InputJsonValue,
) {
  try {
    const result = await mml.sendChangeNotification(
      housingCompanyId,
      actorId,
      type,
      details,
    );
    return { success: true, result };
  } catch (error) {
    console.error("HJT2 Notification Error:", error);
    return { success: false, error: "HJT2-ilmoituksen lähetys epäonnistui." };
  }
}
