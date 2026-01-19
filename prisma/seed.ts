import {
  PrismaClient,
  UserRole,
  BudgetCategory,
  InvoiceStatus,
  TicketStatus,
  TicketPriority,
  TicketType,
  FiscalQuarter,
  TaskCategory,
  GovernanceStatus,
  VoteChoice,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Cleanup
  console.log("🧹 Cleaning up old data...");
  try {
    // Delete in order of dependencies
    await prisma.vote.deleteMany();
    await prisma.initiativeSupport.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.initiative.deleteMany();

    await prisma.ticket.deleteMany();
    await prisma.observation.deleteMany();
    await prisma.leakAlert.deleteMany();

    await prisma.invoice.deleteMany();
    await prisma.budgetLineItem.deleteMany();
    await prisma.monthlyFee.deleteMany();

    await prisma.annualTask.deleteMany();
    await prisma.strategicGoal.deleteMany();
    await prisma.fiscalConfiguration.deleteMany();

    await prisma.booking.deleteMany();
    await prisma.resource.deleteMany();

    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.housingCompany.deleteMany();
  } catch (e) {
    console.warn("Cleanup warning (tables might be empty):", e);
  }

  // 2. Housing Company
  console.log("🏢 Creating Housing Company...");
  const company = await prisma.housingCompany.create({
    data: {
      name: "As Oy Säästötalo",
      businessId: "1234567-8",
      address: "Esimerkkikatu 42",
      city: "Helsinki",
      postalCode: "00100",
      constructionYear: 1985,
      maintenanceFeePerShare: 4.5,
    },
  });

  // 3. Apartments (10 units, Total 1200 shares)
  // 4 * 150 = 600
  // 6 * 100 = 600
  console.log("🏠 Creating Apartments...");
  const apartmentsData = [];

  // A-stair (Big units)
  for (let i = 1; i <= 4; i++) {
    apartmentsData.push({
      apartmentNumber: `A ${i}`,
      floor: i,
      shareCount: 150,
      area: 85.0,
    });
  }
  // B-stair (Smaller units)
  for (let i = 1; i <= 6; i++) {
    apartmentsData.push({
      apartmentNumber: `B ${i}`,
      floor: Math.ceil(i / 2),
      shareCount: 100,
      area: 55.0,
    });
  }

  const apartments = [];
  for (const apt of apartmentsData) {
    const created = await prisma.apartment.create({
      data: {
        housingCompanyId: company.id,
        apartmentNumber: apt.apartmentNumber,
        floor: apt.floor,
        shareCount: apt.shareCount,
        area: apt.area,
        sharesStart: 1, // Mock
        sharesEnd: 100, // Mock
      },
    });
    apartments.push(created);
  }

  // 4. Users (Board & Residents)
  console.log("👥 Creating Users...");
  const boardUser = await prisma.user.create({
    data: {
      email: "pekka.puheenjohtaja@example.com",
      name: "Pekka Puheenjohtaja",
      role: UserRole.BOARD,
      housingCompanyId: company.id,
      apartmentId: apartments[0].id, // A 1
    },
  });

  const residentUser = await prisma.user.create({
    data: {
      email: "matti.meikalainen@example.com",
      name: "Matti Meikäläinen",
      role: UserRole.RESIDENT,
      housingCompanyId: company.id,
      apartmentId: apartments[4].id, // B 1
    },
  });

  // Create users for other apartments for voting
  const otherUsers = [];
  for (let i = 1; i < 4; i++) {
    // 3 more voters
    const user = await prisma.user.create({
      data: {
        email: `asukas${i}@example.com`,
        name: `Asukas ${i}`,
        role: UserRole.RESIDENT,
        housingCompanyId: company.id,
        apartmentId: apartments[i].id,
      },
    });
    otherUsers.push(user);
  }

  // 5. Financials
  console.log("💰 Creating Financial Data...");

  // Budget
  const budgetCategories = [
    { cat: BudgetCategory.HEATING, budget: 45000 },
    { cat: BudgetCategory.WATER, budget: 12000 }, // Target for breach
    { cat: BudgetCategory.MAINTENANCE, budget: 15000 },
    { cat: BudgetCategory.ADMIN, budget: 18000 },
    { cat: BudgetCategory.CLEANING, budget: 8000 },
  ];

  for (const b of budgetCategories) {
    await prisma.budgetLineItem.create({
      data: {
        housingCompanyId: company.id,
        year: 2026,
        category: b.cat,
        budgetedAmount: b.budget,
        actualSpent: 0, // Calculations derived from invoices
      },
    });
  }

  // Invoices
  // Water Breach: Budget 12000. Need ~13800.
  await prisma.invoice.create({
    data: {
      housingCompanyId: company.id,
      category: BudgetCategory.WATER,
      amount: 13800,
      dueDate: new Date("2026-02-15"),
      status: InvoiceStatus.PAID,
      vendorName: "Helsingin Vesi",
      description: "Vesilasku Q1 + Tasaus",
      approvedById: boardUser.id,
    },
  });

  // Other Invoices
  await prisma.invoice.create({
    data: {
      housingCompanyId: company.id,
      category: BudgetCategory.HEATING,
      amount: 3500,
      dueDate: new Date("2026-01-15"),
      status: InvoiceStatus.PAID,
      vendorName: "Helen Oy",
      description: "Kaukolämpö Tammikuu",
    },
  });

  await prisma.invoice.create({
    data: {
      housingCompanyId: company.id,
      category: BudgetCategory.MAINTENANCE,
      amount: 450,
      dueDate: new Date("2026-03-15"),
      status: InvoiceStatus.PENDING, // Current pending
      vendorName: "Putki-Pekka Oy",
      description: "Hanan korjaus B4",
    },
  });

  // 6. Annual Clock & Fiscal
  console.log("📅 Creating Annual Clock...");
  await prisma.fiscalConfiguration.create({
    data: {
      housingCompanyId: company.id,
      startMonth: 1,
    },
  });

  const tasks = [
    {
      title: "Tilinpäätös",
      quarter: FiscalQuarter.Q1,
      month: 2,
      cat: TaskCategory.FINANCE,
    },
    {
      title: "Kevättalkoot",
      quarter: FiscalQuarter.Q1,
      month: 3,
      cat: TaskCategory.MAINTENANCE,
    }, // March is Q1 in cal year
    {
      title: "Yhtiökokous",
      quarter: FiscalQuarter.Q2,
      month: 5,
      cat: TaskCategory.GOVERNANCE,
      isStatutory: true,
    },
    {
      title: "IV-kanavien puhdistus",
      quarter: FiscalQuarter.Q3,
      month: 8,
      cat: TaskCategory.MAINTENANCE,
    },
    {
      title: "Syystalkoot",
      quarter: FiscalQuarter.Q4,
      month: 10,
      cat: TaskCategory.MAINTENANCE,
    },
    {
      title: "Budjetointi",
      quarter: FiscalQuarter.Q4,
      month: 11,
      cat: TaskCategory.FINANCE,
    },
  ];

  for (const t of tasks) {
    await prisma.annualTask.create({
      data: {
        housingCompanyId: company.id,
        title: t.title,
        category: t.cat,
        quarter: t.quarter,
        month: t.month,
        deadline: new Date(2026, t.month - 1, 28),
        isStatutory: t.isStatutory || false,
      },
    });
  }

  // 7. Governance
  console.log("🗳️ Creating Governance Data...");
  const initiative = await prisma.initiative.create({
    data: {
      housingCompanyId: company.id,
      title: "Sähköautojen latausinfra",
      description:
        "Hankitaan kartoitus ja suunnitelma 11kW latausasemille kaikille autopaikoille.",
      status: GovernanceStatus.VOTING,
      authorId: boardUser.id,
    },
  });

  // Votes
  // Pekka (Board, A1, 150 shares) -> YES
  await prisma.vote.create({
    data: {
      initiativeId: initiative.id,
      userId: boardUser.id,
      apartmentId: apartments[0].id,
      choice: VoteChoice.YES,
      shares: 150,
    },
  });
  // Matti (Resident, B1, 100 shares) -> NO
  await prisma.vote.create({
    data: {
      initiativeId: initiative.id,
      userId: residentUser.id,
      apartmentId: apartments[4].id, // B1
      choice: VoteChoice.NO,
      shares: 100,
    },
  });
  // Other users (A2: 150, A3: 150) -> YES
  await prisma.vote.create({
    data: {
      initiativeId: initiative.id,
      userId: otherUsers[0].id,
      apartmentId: apartments[1].id,
      choice: VoteChoice.YES,
      shares: 150,
    },
  });
  await prisma.vote.create({
    data: {
      initiativeId: initiative.id,
      userId: otherUsers[1].id,
      apartmentId: apartments[2].id,
      choice: VoteChoice.YES,
      shares: 150,
    },
  });

  // 8. Maintenance Tickets (3D Pins)
  console.log("🔧 Creating Maintenance Tickets...");

  const tickets = [
    {
      title: "Vesivuoto kellarissa",
      type: TicketType.MAINTENANCE,
      status: TicketStatus.OPEN,
      priority: TicketPriority.CRITICAL,
      loc: { x: 10, y: -2, z: 5 },
    },
    {
      title: "Ulko-oven lukko jumittaa",
      type: TicketType.MAINTENANCE,
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      loc: { x: 0, y: 0, z: 15 },
    }, // Main entrance
    {
      title: "Katon tarkistus",
      type: TicketType.MAINTENANCE,
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.MEDIUM,
      loc: { x: 5, y: 10, z: 5 },
    },
    {
      title: "Parvekkeen maalaus B4",
      type: TicketType.RENOVATION,
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      loc: { x: -10, y: 4, z: -5 },
    },
    {
      title: "Patteri ei lämpene A2",
      type: TicketType.MAINTENANCE,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      loc: { x: 8, y: 3, z: 2 },
    },
  ];

  for (const t of tickets) {
    // Create Observation first to hold location
    const obs = await prisma.observation.create({
      data: {
        housingCompanyId: company.id,
        userId: residentUser.id, // Reported by resident
        component: "Structure",
        description: t.title,
        status: "OPEN",
        location: JSON.stringify(t.loc),
      },
    });

    await prisma.ticket.create({
      data: {
        housingCompanyId: company.id,
        createdById: residentUser.id,
        title: t.title,
        description: t.title + " vaatii huomiota.",
        type: t.type,
        status: t.status,
        priority: t.priority,
        observationId: obs.id,
      },
    });
  }

  console.log("✅ Seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
