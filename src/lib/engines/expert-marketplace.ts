// talovahti/src/lib/engines/expert-marketplace.ts
import { prisma } from "@/lib/db";

export const ExpertMarketplace = {
  /**
   * Fetches the top 3 matching vendors for a given category.
   */
  async getMatchingVendors(category: string) {
    // In a real app, this would query a central marketplace DB or an external API
    // For now, we fetch from our local Vendor table or return mock data if empty
    const vendors = await prisma.vendor.findMany({
      take: 3,
      // Simplified matching: search by name or category if it exists
      where: {
        OR: [
          { category: { contains: category, mode: "insensitive" } },
          { name: { contains: category, mode: "insensitive" } },
        ],
      },
    });

    if (vendors.length > 0) return vendors;

    // Return mock vendors if none found in DB
    return [
      {
        id: "v1",
        name: "Helsingin Putki & Sähkö Oy",
        category: "LVI",
        rating: 4.8,
      },
      {
        id: "v2",
        name: "Espoon Urakointipalvelu",
        category: "Yleisurakka",
        rating: 4.5,
      },
      {
        id: "v3",
        name: "Uudenmaan Kiinteistökorjaus",
        category: "Rakennus",
        rating: 4.2,
      },
    ];
  },
};
