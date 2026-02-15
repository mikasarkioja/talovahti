"use server";

import { fennoa } from "@/lib/services/fennoa";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RBAC } from "@/lib/auth/rbac";
import { gamification } from "@/lib/engines/gamification";
import { HealthScoreEngine } from "@/lib/engines/health";

export async function approveInvoiceAction(
  invoiceId: string,
  amount: number,
  housingCompanyId: string,
  userId: string,
) {
  try {
    // 1. RBAC Check
    const canApprove = await RBAC.canAccess(
      userId,
      "FINANCE",
      housingCompanyId,
    );
    if (!canApprove) {
      return {
        success: false,
        error: "Vain hallituksen jäsenillä on oikeus hyväksyä laskuja.",
      };
    }

    // 2. Fennoa API Call (Mock)
    const result = await fennoa.approveInvoice(invoiceId);

    if (result.success) {
      // 3. Create Audit Log (Transactional)
      await prisma.$transaction([
        prisma.auditLog.create({
          data: {
            action: "INVOICE_APPROVED",
            userId: userId,
            targetId: invoiceId,
            impactScore: 50, // XP Reward
            metadata: {
              invoiceId,
              amount,
              timestamp: new Date().toISOString(),
            },
          },
        }),
        // Optional: Update local DB invoice if it exists
        prisma.invoice.updateMany({
          where: {
            externalId: invoiceId,
            housingCompanyId: housingCompanyId,
          },
          data: {
            status: "APPROVED",
            approvedById: userId,
          },
        }),
      ]);

      // 4. Update XP and Health via Engines
      await gamification.processAuditAction(userId, "INVOICE_APPROVED", {
        amount,
        speedDays: 1, // Mock speed for now
      });
      await HealthScoreEngine.recalculateBuildingHealth(housingCompanyId);

      revalidatePath("/");
      revalidatePath("/admin/finance");

      return { success: true };
    }

    return {
      success: false,
      error: "Laskun hyväksyntä epäonnistui Fennoassa.",
    };
  } catch (error) {
    console.error("Approve Invoice Action Error:", error);
    return { success: false, error: "Järjestelmävirhe laskun hyväksynnässä." };
  }
}

/**
 * Fetches open purchase invoices from Fennoa.
 */
export async function fetchInvoicesAction() {
  try {
    const fennoaInvoices = await fennoa.getPurchaseInvoices();
    return { success: true, data: fennoaInvoices };
  } catch (error) {
    console.error("Fetch Invoices Error:", error);
    return { success: false, error: "Laskujen haku epäonnistui Fennoasta." };
  }
}
