// talovahti/src/lib/engines/rfq-generator.ts
import { prisma } from "@/lib/db";

export const RFQGenerator = {
  /**
   * Generates a structured RFQ (Request for Quotation) based on a project and its linked ticket.
   */
  async generateRFQ(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        observation: {
          include: {
            ticket: true,
          },
        },
        housingCompany: {
          include: {
            apartments: true,
          },
        },
      },
    });

    if (!project) throw new Error("Project not found");

    const ticket = project.observation?.ticket;
    const building = project.housingCompany;

    const rfq = {
      rfqId: `RFQ-${project.id.slice(-6).toUpperCase()}`,
      title: project.title,
      description: project.description || ticket?.description || "Ei kuvausta.",
      technicalSpecs: {
        type: project.type,
        category: ticket?.category || "MAINTENANCE",
        priority: ticket?.priority || "MEDIUM",
        buildingMetadata: {
          name: building.name,
          address: building.address,
          totalApartments: building.apartments.length,
          builtYear: 1995, // Mocked or fetched from metadata
        },
      },
      legalTerms: {
        compliance: project.type === "SUPERVISOR" ? "KSA 2013" : "YSE 1998",
        commission: "5% platform fee applied to final contract price",
      },
      submissionDeadline: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 7 days from now
    };

    return rfq;
  },

  /**
   * Generates a temporary access token (Magic Link) for a vendor.
   */
  async generateMagicLink(projectId: string, vendorId: string) {
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    await prisma.projectAccessToken.create({
      data: {
        token,
        projectId,
        vendorId,
        expiresAt,
      },
    });

    // In a real app, this would be an absolute URL
    return `/vendor/submit-bid?token=${token}`;
  },
};
