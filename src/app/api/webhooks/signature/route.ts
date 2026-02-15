import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { gamification } from "@/lib/engines/gamification";
import crypto from "crypto";
import { SignatureStatus, ProjectStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const signature = req.headers.get("X-Visma-Signature");
    const secret = process.env.VISMA_SIGN_WEBHOOK_SECRET;

    if (!secret) {
      console.error("VISMA_SIGN_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // 1. Security: HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Logic: Handle "document_signed" event
    if (body.status === "document_signed") {
      const documentUuid = body.document_uuid;

      // Find the project first to get the housingCompanyId
      const project = await prisma.project.findUnique({
        where: { signatureUuid: documentUuid },
        include: { 
          housingCompany: { 
            include: { 
              users: { 
                take: 1, 
                where: { 
                  OR: [
                    { role: 'ADMIN' },
                    { role: 'BOARD_MEMBER' }
                  ]
                } 
              } 
            } 
          } 
        }
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found for this UUID" }, { status: 404 });
      }

      // Use a valid user from the company for the audit log, or fallback
      const actorUserId = project.housingCompany.users[0]?.id;
      
      if (!actorUserId) {
        console.warn(`No admin/board user found for company ${project.housingCompanyId} to associate with webhook audit log.`);
      }

      await prisma.$transaction(async (tx) => {
        // Update Project status to EXECUTION and signatureStatus to SIGNED
        await tx.project.update({
          where: { id: project.id },
          data: {
            status: ProjectStatus.EXECUTION,
            signatureStatus: SignatureStatus.SIGNED,
          },
        });

        // AuditLog entry with professional Finnish
        // If no user found, we might need a fixed system user ID or handle nullable if schema allowed (it doesn't)
        // For now, we use a fallback string if no user is found, but this might fail if it's not a valid CUID
        // Better: search for ANY user in the company if no admin/board found
        let finalUserId = actorUserId;
        if (!finalUserId) {
          const anyUser = await tx.user.findFirst({
            where: { housingCompanyId: project.housingCompanyId }
          });
          finalUserId = anyUser?.id;
        }

        if (finalUserId) {
          await tx.auditLog.create({
            data: {
              action: "CONTRACT_SIGNED",
              userId: finalUserId,
              targetId: project.id,
              metadata: {
                documentUuid,
                message: "Sopimus allekirjoitettu ja projekti siirretty toteutusvaiheeseen.",
              },
            },
          });
        }

        // Reward Board +200 XP
        await gamification.rewardBoardForContract(project.housingCompanyId);
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
