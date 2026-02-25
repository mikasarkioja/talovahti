"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { BuildingConfig } from "@/lib/three/BuildingGenerator";

export async function saveBuildingConfig(
  housingCompanyId: string,
  config: BuildingConfig,
  generateApartments: boolean = false
) {
  try {
    // Update housing company config
    const updated = await prisma.housingCompany.update({
      where: { id: housingCompanyId },
      data: { buildingConfig: config as any },
    });

    if (generateApartments) {
      // Basic automatic apartment generation logic
      // This is a simple version, in reality we might want to be more careful
      
      const floors = config.floors;
      const unitsPerFloor = config.unitsPerFloor;
      const staircases = config.staircases;

      const apartmentsToCreate = [];
      for (const stair of staircases) {
        for (let f = 1; f <= floors; f++) {
          for (let u = 1; u <= unitsPerFloor; u++) {
            const aptNum = `${stair} ${((f - 1) * unitsPerFloor) + u}`;
            apartmentsToCreate.push({
              housingCompanyId,
              apartmentNumber: aptNum,
              floor: f,
              sharesStart: 0,
              sharesEnd: 0,
              shareCount: 100, // Default
            });
          }
        }
      }

      // Create apartments (skip duplicates if they exist)
      for (const apt of apartmentsToCreate) {
        await prisma.apartment.upsert({
          where: {
            housingCompanyId_apartmentNumber: {
              housingCompanyId,
              apartmentNumber: apt.apartmentNumber,
            },
          },
          update: {
            floor: apt.floor,
          },
          create: apt,
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/resident");
    revalidatePath("/digital-twin");
    
    return { success: true, company: updated };
  } catch (error: any) {
    console.error("Error saving building config:", error);
    return { success: false, error: error.message };
  }
}
