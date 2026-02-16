"use server";

import { prisma } from "@/lib/db";

export async function getTestUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        apartment: true,
      },
      take: 20,
    });

    const mockUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      apartmentId: u.apartmentNumber || u.apartment?.apartmentNumber || u.apartmentId,
      housingCompanyId: u.housingCompanyId,
      canApproveFinance: u.canApproveFinance,
      shareCount: u.role === "RESIDENT" ? 0 : (u.apartment?.shareCount || 0),
    }));

    console.log(`Fetched ${mockUsers.length} test users for switcher`);
    return { success: true, users: mockUsers };
  } catch (error) {
    console.error("Error fetching test users:", error);
    return { success: false, error: "Käyttäjien haku epäonnistui" };
  }
}
