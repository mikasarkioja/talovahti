"use server";

import { stripe } from "@/lib/services/stripe";
import { prisma } from "@/lib/db";
import { OrderType, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Creates a Stripe Checkout session for ordering a Property Manager's Certificate.
 */
export async function createCertificateCheckoutAction(
  userId: string,
  housingCompanyId: string,
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { apartment: true },
    });

    if (!user) throw new Error("Käyttäjää ei löytynyt.");

    const amount = 4500; // 45.00 EUR in cents

    // 1. Create Checkout Session (Mock)
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const checkoutSession = await stripe.createCheckoutSession({
      userId,
      amount,
      productName: "Isännöitsijäntodistus - Reaaliaikainen",
      successUrl: `${baseUrl}/admin/certificate?session_id={CHECKOUT_SESSION_ID}&user=${user.email}`,
      cancelUrl: `${baseUrl}/finance`,
      metadata: {
        userId,
        housingCompanyId,
        type: "CERTIFICATE_ORDER",
      },
    });

    // 2. Create pending Order in DB
    await prisma.order.create({
      data: {
        userId,
        housingCompanyId,
        type: OrderType.CERTIFICATE,
        amount: 45.0,
        platformRevenue: 45.0, // 100% commission as requested
        status: OrderStatus.PENDING,
        metadata: JSON.stringify({
          product: "Isännöitsijäntodistus",
          sessionId: checkoutSession.id,
        }),
      },
    });

    return { success: true, url: checkoutSession.url };
  } catch (error) {
    console.error("Certificate Checkout Error:", error);
    return { success: false, error: "Maksutapahtuman aloitus epäonnistui." };
  }
}
