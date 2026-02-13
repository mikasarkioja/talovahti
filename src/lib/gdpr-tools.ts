import { prisma } from "@/lib/db";
import { createHash } from "crypto";

export const GDPRTools = {
  async anonymizeUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // Hash personal data
    const hash = createHash("sha256")
      .update(userId + Date.now())
      .digest("hex")
      .substring(0, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: `Anonymized User ${hash}`,
        email: `deleted_${hash}@example.com`,
        password: null,
        deletedAt: new Date(),
      },
    });

    // Log the erasure
    await prisma.gDPRLog.create({
      data: {
        actorId: userId, // Self-deletion or Admin
        action: "DELETE",
        targetEntity: "User",
        resource: `User:${userId}`,
        reason: "Right to Erasure invoked",
        details: "User data anonymized and hard identifiers removed.",
      },
    });
  },

  async generateDataPortabilityArchive(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        createdTickets: true,
        votes: true,
        surveyResponses: true,
        bookings: true,
        apartment: true,
      },
    });

    if (!user) throw new Error("User not found");

    // Standard JSON Format
    const archive = {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      subject: {
        id: user.id,
        role: user.role,
      },
      data: {
        tickets: user.createdTickets,
        votes: user.votes,
        surveys: user.surveyResponses,
        bookings: user.bookings,
        apartment: user.apartment,
      },
    };

    // Log export
    await prisma.gDPRLog.create({
      data: {
        actorId: userId,
        action: "EXPORT",
        targetEntity: "User",
        resource: `User:${userId}`,
        reason: "Right to Data Portability invoked",
        details: "Subject Access Request (SAR)",
      },
    });

    return archive;
  },
};
