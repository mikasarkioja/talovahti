"use server";

import { prisma } from "@/lib/db";

export async function getTestUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        apartment: true,
        housingCompany: true,
      },
      take: 50,
    });

    const mockUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      apartmentId: u.apartmentId,
      apartmentNumber: u.apartmentNumber || u.apartment?.apartmentNumber,
      housingCompanyId: u.housingCompanyId,
      housingCompanyName: u.housingCompany?.name, // Added for switcher
      canApproveFinance: u.canApproveFinance,
      phone: u.phone,
      language: u.language,
    }));

    console.log(`Fetched ${mockUsers.length} test users for switcher`);
    return { success: true, users: mockUsers };
  } catch (error) {
    console.error("Error fetching test users:", error);
    return { success: false, error: "Käyttäjien haku epäonnistui" };
  }
}
