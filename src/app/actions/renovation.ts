"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RenovationSchema = z.object({
  housingCompanyId: z.string(),
  apartmentId: z.string(),
  userId: z.string(),
  x: z.coerce.number(),
  y: z.coerce.number(),
  z: z.coerce.number(),
  roomType: z.string(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  waterproofingCert: z.instanceof(File).optional(),
  plumberLicense: z.string().optional(),
  structuralPlans: z.coerce.boolean().optional(),
  sewerModification: z.coerce.boolean().optional(),
});

export async function createRenovationNotification(formData: FormData) {
  try {
    const rawData = {
      housingCompanyId: formData.get("housingCompanyId"),
      apartmentId: formData.get("apartmentId"),
      userId: formData.get("userId"),
      x: formData.get("x"),
      y: formData.get("y"),
      z: formData.get("z"),
      roomType: formData.get("roomType"),
      description: formData.get("description"),
      waterproofingCert: formData.get("waterproofingCert"),
      plumberLicense: formData.get("plumberLicense"),
      structuralPlans: formData.get("structuralPlans"),
      sewerModification: formData.get("sewerModification"),
    };

    // Validate with Zod
    const validatedFields = RenovationSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Mock File Upload (In production, upload to S3/Blob storage)
    let certUrl = undefined;
    if (data.waterproofingCert && data.waterproofingCert.size > 0) {
      // Upload logic here...
      certUrl = `mock-upload/${data.waterproofingCert.name}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Observation
      const observation = await tx.observation.create({
        data: {
          component: data.roomType,
          description: `Renovation Notification: ${data.description}`,
          location: JSON.stringify({ x: data.x, y: data.y, z: data.z }),
          status: "OPEN",
          housingCompanyId: data.housingCompanyId,
          userId: data.userId,
          imageUrl: certUrl, // Store file URL if exists
        },
      });

      // 2. Create Ticket
      const ticket = await tx.ticket.create({
        data: {
          title: `Renovation Notification (${data.roomType})`,
          description: `
            Renovation Details:
            - Room Type: ${data.roomType}
            - Description: ${data.description}
            ${certUrl ? `- Waterproofing Cert: ${certUrl}` : ""}
            ${data.plumberLicense ? `- Plumber License: ${data.plumberLicense}` : ""}
            ${data.structuralPlans ? `- Structural Plans Required: Yes` : ""}
            ${data.sewerModification ? `- Sewer/Water Modification: Yes` : ""}
          `,
          status: "OPEN",
          priority: "MEDIUM",
          type: "RENOVATION",
          housingCompanyId: data.housingCompanyId,
          apartmentId: data.apartmentId,
          createdById: data.userId,
          observationId: observation.id,
        },
      });

      // 3. Log GDPR Event
      await tx.gDPRLog.create({
        data: {
          actorId: data.userId,
          action: "WRITE",
          targetEntity: "Ticket",
          resource: `Ticket:${ticket.id}`,
          reason: "CREATE_RENOVATION_NOTIFICATION",
          details: `Submitted structural data for apartment ${data.apartmentId}`,
          housingCompanyId: data.housingCompanyId,
        },
      });

      return ticket;
    });

    revalidatePath("/maintenance/tickets");
    return { success: true, ticketId: result.id };
  } catch (error) {
    console.error("Renovation submission error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
