"use server";

import { prisma } from "@/lib/db";
import { fennoa } from "@/services/fennoa";
import { revalidatePath } from "next/cache";
import { RBAC } from "@/lib/auth/rbac";
import { HealthScoreEngine } from "@/lib/engines/health";
import { GamificationEngine } from "@/lib/engines/gamification";

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

/**
 * Approves a purchase invoice in Fennoa and logs the action to Audit Trail.
 */
export async function approveInvoiceAction(
  invoiceId: string,
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
        error: "Vain hallituksen jäsenet voivat hyväksyä laskuja.",
      };
    }

    // 2. Process via Fennoa API
    const result = await fennoa.approveInvoice(invoiceId);
    if (!result) throw new Error("Fennoa system rejected the approval.");

    // 3. Create GDPR Log & Audit Trail
    await RBAC.auditAccess(
      userId,
      "WRITE",
      `Invoice:${invoiceId}`,
      "Ostolaskun hyväksyntä",
    );

    // 4. Update local invoice if synchronized
    const localInvoice = await prisma.invoice.findFirst({
      where: { externalId: invoiceId, housingCompanyId },
    });

    if (localInvoice) {
      await prisma.invoice.update({
        where: { id: localInvoice.id },
        data: {
          status: "APPROVED",
          approvedById: userId,
        },
      });
    }

    // 5. Update XP and Health via Engines
    let speedDays = 99;
    if (localInvoice) {
      speedDays =
        (Date.now() - new Date(localInvoice.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
    }

    await GamificationEngine.processAuditAction(userId, "INVOICE_APPROVED", {
      speedDays,
    });
    await HealthScoreEngine.recalculateBuildingHealth(housingCompanyId);

    revalidatePath("/");
    revalidatePath("/admin/finance");

    return { success: true };
  } catch (error) {
    console.error("Approve Invoice Action Error:", error);
    return { success: false, error: "Laskun hyväksyntä epäonnistui." };
  }
}
