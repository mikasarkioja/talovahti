// src/app/actions/certificate-actions.ts
"use server";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/services/stripe";
import { RBAC } from "@/lib/auth/rbac";

/**
 * Creates a Stripe checkout session for an apartment certificate (Isännöitsijäntodistus).
 */
export async function createCertificateCheckoutAction(
  userId: string,
  companyId: string,
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { apartmentNumber: true, email: true },
    });

    if (!user) throw new Error("Käyttäjää ei löytynyt.");

    const session = await stripe.createCheckoutSession({
      userId,
      amount: 4500, // 45.00 EUR in cents
      productName: `Isännöitsijäntodistus - Asunto ${user.apartmentNumber || "N/A"}`,
      metadata: {
        type: "CERTIFICATE",
        userId,
        companyId,
        apartmentNumber: user.apartmentNumber || "N/A",
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/resident?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/resident?canceled=true`,
    });

    // Log the order attempt
    await RBAC.auditAccess(
      userId,
      "READ",
      `HousingCompany:${companyId}:Certificate`,
      `Isännöitsijäntodistuksen tilaus aloitettu asunnolle ${user.apartmentNumber || "N/A"}`,
    );

    return { success: true, url: session.url };
  } catch (error) {
    console.error("Certificate Checkout Error:", error);
    return { success: false, error: "Tilauksen luonti epäonnistui." };
  }
}

/**
 * Finalizes a contract after bid selection (moved from old snippet and corrected)
 * Note: Real logic is now handled in contract-actions.ts but kept for compatibility
 */
export async function finalizeContract(bidId: string, userId: string) {
  try {
    const bid = await prisma.tenderBid.findUnique({
      where: { id: bidId },
      include: {
        tender: { include: { project: true } },
        vendor: true,
      },
    });

    if (!bid) throw new Error("Tarjousta ei löytynyt");

    // Logic now handled in contract-actions.ts
    // This is a placeholder for any certificate-related finalization if needed

    await RBAC.auditAccess(
      userId,
      "WRITE",
      `Tender:${bid.tenderId}`,
      `Sopimusprosessi aloitettu tarjoukselle ${bidId}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Finalize Contract Error:", error);
    return { success: false, error: "Sopimuksen vahvistus epäonnistui." };
  }
}
