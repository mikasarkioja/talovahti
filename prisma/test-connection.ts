import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔌 Testing Database Connection...");
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl
    ? dbUrl.includes("@")
      ? `...${dbUrl.split("@")[1]}`
      : "Invalid URL format"
    : "Undefined";

  console.log(`   URL Host: ${maskedUrl}`);

  try {
    const count = await prisma.housingCompany.count();
    console.log(`✅ Connection Successful! Found ${count} housing companies.`);

    const first = await prisma.housingCompany.findFirst();
    if (first) {
      console.log(`   First company: ${first.name} (${first.businessId})`);
    }
  } catch (e) {
    console.error("❌ Connection Failed:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
