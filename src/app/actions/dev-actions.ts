"use server";

import { prisma } from "@/lib/db";

export async function getTestUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        apartmentId: true,
        housingCompanyId: true,
        canApproveFinance: true,
      },
      take: 20,
    });
    // Add default shareCount for MockUser compatibility
    const mockUsers = users.map((u) => ({
      ...u,
      shareCount: 100, // Default for dev
    }));
    return { success: true, users: mockUsers };
  } catch (error) {
    console.error("Error fetching test users:", error);
    return { success: false, error: "Käyttäjien haku epäonnistui" };
  }
}
