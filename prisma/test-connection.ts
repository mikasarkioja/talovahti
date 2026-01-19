import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔌 Testing Database Connection...");
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "Set" : "Missing"}`);

  try {
    const count = await prisma.housingCompany.count();
    console.log(`✅ Connection Successful! Found ${count} housing companies.`);

    const first = await prisma.housingCompany.findFirst();
    if (first) {
      console.log(`First company: ${first.name} (${first.businessId})`);
    }
  } catch (e) {
    console.error("❌ Connection Failed:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
