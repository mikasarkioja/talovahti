import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/services/stripe";
import { OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const signature = req.headers.get("Stripe-Signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // 1. Verify Webhook Signature (Mock)
    const isValid = await stripe.verifyWebhookSignature(rawBody, signature || "", secret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Handle checkout.session.completed
    if (body.type === "checkout.session.completed") {
      const session = body.data.object;
      const { userId, housingCompanyId, type } = session.metadata;

      if (type === "CERTIFICATE_ORDER") {
        await prisma.$transaction(async (tx) => {
          // Update Order Status
          await tx.order.updateMany({
            where: { 
              userId, 
              housingCompanyId,
              status: OrderStatus.PENDING,
              metadata: { contains: session.id }
            },
            data: { status: OrderStatus.PAID }
          });

          // Create Audit Log
          await tx.auditLog.create({
            data: {
              action: "CERTIFICATE_PURCHASED",
              userId,
              targetId: housingCompanyId,
              metadata: {
                amount: 45.0,
                message: "Asukas osti isännöitsijäntodistuksen.",
                sessionId: session.id
              }
            }
          });
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
