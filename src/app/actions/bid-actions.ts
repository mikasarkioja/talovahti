"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AIComparisonEngine } from "@/lib/engines/ai-comparison";
import { RBAC } from "@/lib/auth/rbac";

export async function submitBidAction(formData: FormData) {
  const token = formData.get("token") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const duration = formData.get("duration") as string;
  const notes = formData.get("notes") as string;

  if (!token || isNaN(amount)) {
    throw new Error("Virheelliset tarjoustiedot");
  }

  const invitation = await prisma.bidInvitation.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          tenders: {
            where: { type: "CONSTRUCTION", status: "OPEN" },
            take: 1,
          },
        },
      },
      vendor: true,
    },
  });

  if (!invitation) throw new Error("Tarjouspyyntöä ei löytynyt");
  if (invitation.usedAt) throw new Error("Tämä tarjouslinkki on jo käytetty");
  if (new Date() > invitation.expiresAt)
    throw new Error("Tarjouslinkki on vanhentunut");

  const tender = invitation.project.tenders[0];
  if (!tender)
    throw new Error("Avointa urakkakilpailua ei löytynyt tälle projektille");

  // Create the bid
  const bid = await prisma.tenderBid.create({
    data: {
      tenderId: tender.id,
      vendorId: invitation.vendorId,
      companyName: invitation.vendor.name,
      price: amount,
      durationText: duration,
      notes: notes,
      status: "RECEIVED",
    },
  });

  // Mark invitation as used
  await prisma.bidInvitation.update({
    where: { id: invitation.id },
    data: { usedAt: new Date() },
  });

  // Trigger AI Scoring
  await AIComparisonEngine.analyzeBids(tender.id);

  // Audit Trail
  await RBAC.auditAccess(
    "SYSTEM",
    "WRITE",
    `Tender:${tender.id}`,
    `Urakoitsija ${invitation.vendor.name} jätti tarjouksen urakkaan (Hinta: ${amount}€)`,
  );

  // Revalidate relevant paths
  revalidatePath(
    `/governance/projects/${invitation.projectId}/construction-tender`,
  );
  revalidatePath(`/admin/ops`);

  return { success: true, bidId: bid.id };
}
