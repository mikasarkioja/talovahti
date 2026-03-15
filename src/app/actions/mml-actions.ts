"use server";

import { MMLService } from "@/lib/services/mml";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

/**
 * Server Action to trigger HTJ (MML) Shareholder Register Sync.
 */
export async function triggerHjt2SyncAction(housingCompanyId: string) {
  const session = await getSession();
  const user = session?.user as { id: string } | undefined;
  const actorId = user?.id;

  if (!actorId) {
    return { success: false, error: "Istunto ei ole voimassa." };
  }

  // Permission check could be added here (e.g., ADMIN only)

  try {
    const result = await MMLService.transferShareholderRegister(
      housingCompanyId,
      actorId,
    );

    if (result.success) {
      revalidatePath("/admin/settings");
      return {
        success: true,
        confirmationId: result.confirmationId,
        message: "Osakasluettelon synkronointi aloitettu onnistuneesti.",
      };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: unknown) {
    console.error("HJT2 Action Error:", error);
    return { success: false, error: "Palvelun kutsuminen epäonnistui." };
  }
}
