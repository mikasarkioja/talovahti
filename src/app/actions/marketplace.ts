"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BidStatus } from "@prisma/client";

const bidSchema = z.object({
  token: z.string().min(1, "Token is required"),
  amount: z.number().positive("Amount must be positive"),
  startDate: z.date().min(new Date(), "Start date must be in the future"),
  notes: z.string().optional(),
});

export async function submitBid(formData: {
  token: string;
  amount: number;
  startDate: Date;
  notes?: string;
}) {
  try {
    // 1. Validate Input
    const validated = bidSchema.parse(formData);

    // 2. Validate Token
    const accessToken = await prisma.projectAccessToken.findUnique({
      where: { token: validated.token },
      include: { project: true, vendor: true },
    });

    if (!accessToken) {
      return { success: false, error: "Virheellinen pääsyavain." };
    }

    if (accessToken.expiresAt < new Date()) {
      return { success: false, error: "Pääsyavain on vanhentunut." };
    }

    if (accessToken.usedAt) {
      return { success: false, error: "Tämä pääsyavain on jo käytetty." };
    }

    // 3. Create Bid & Update System State in Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the Bid
      const bid = await tx.bid.create({
        data: {
          amount: validated.amount,
          startDate: validated.startDate,
          notes: validated.notes || "",
          status: BidStatus.PENDING,
          projectId: accessToken.projectId,
          vendorId: accessToken.vendorId,
        },
      });

      // Mark token as used
      await tx.projectAccessToken.update({
        where: { id: accessToken.id },
        data: { usedAt: new Date() },
      });

      // Update Project Status to reflect incoming bids if it's still in DIAGNOSIS/ROI
      if (accessToken.project.status === "DIAGNOSIS" || accessToken.project.status === "ROI_ANALYSIS") {
        await tx.project.update({
          where: { id: accessToken.projectId },
          data: { status: "TENDERING" },
        });
      }

      return bid;
    });

    // 4. Revalidate relevant paths
    revalidatePath("/admin/ops");
    revalidatePath("/governance/projects");
    revalidatePath(`/public/bid/${validated.token}`);

    return { success: true, bidId: result.id };
  } catch (error) {
    console.error("Submit Bid Error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Tarjouksen lähettäminen epäonnistui." };
  }
}

/**
 * Validates a token and returns project details for the public page
 */
export async function getProjectByToken(token: string) {
  try {
    const accessToken = await prisma.projectAccessToken.findUnique({
      where: { token },
      include: {
        project: {
          include: {
            observation: true,
          },
        },
        vendor: true,
      },
    });

    if (!accessToken) return { error: "Linkki on virheellinen." };
    if (accessToken.expiresAt < new Date()) return { error: "Linkki on vanhentunut." };
    if (accessToken.usedAt) return { error: "Tarjous on jo lähetetty tällä linkillä." };

    return {
      success: true,
      project: accessToken.project,
      vendor: accessToken.vendor,
    };
  } catch (error) {
    console.error("Get Project By Token Error:", error);
    return { error: "Haku epäonnistui." };
  }
}
