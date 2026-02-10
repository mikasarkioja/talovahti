import {
  PrismaClient,
  UserRole,
  BudgetCategory,
  InvoiceStatus,
  TicketStatus,
  TicketPriority,
  TicketType,
  TicketCategory,
  TriageLevel,
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
    // Delete in order of dependencies (Child-to-Parent)
    await prisma.milestone.deleteMany();
    await prisma.legalContract.deleteMany();
    await prisma.projectAccessToken.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.tenderBid.deleteMany();
    await prisma.tender.deleteMany();
    await prisma.siteReport.deleteMany();
    await prisma.changeOrder.deleteMany();
    await prisma.buildingUpdate.deleteMany();
    await prisma.loanApplication.deleteMany();
    await prisma.financialScenario.deleteMany();
    await prisma.project.deleteMany();

    await prisma.vote.deleteMany();
    await prisma.initiativeSupport.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.initiative.deleteMany();
    await prisma.meetingDocument.deleteMany();
    await prisma.meeting.deleteMany();

    await prisma.pollVote.deleteMany();
    await prisma.pollOption.deleteMany();
    await prisma.poll.deleteMany();

    await prisma.ticket.deleteMany();
    await prisma.expertAssessment.deleteMany();
    await prisma.solutionOption.deleteMany();
    await prisma.observation.deleteMany();
    await prisma.leakAlert.deleteMany();
    await prisma.renovation.deleteMany();
    await prisma.buildingComponent.deleteMany();
    await prisma.thermalLeak.deleteMany();

    await prisma.invoice.deleteMany();
    await prisma.budgetLineItem.deleteMany();
    await prisma.monthlyFee.deleteMany();
    await prisma.financialStatement.deleteMany();
    await prisma.investmentGrade.deleteMany();
    await prisma.gDPRLog.deleteMany();

    await prisma.annualTask.deleteMany();
    await prisma.strategicGoal.deleteMany();
    await prisma.fiscalConfiguration.deleteMany();

    await prisma.booking.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.powerEvent.deleteMany();

    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.housingCompany.deleteMany();
    await prisma.vendor.deleteMany();
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
      totalSqm: 2500.0, // Total building area
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

  const demoTickets = [
    {
      title: "Vesivuoto kellarissa",
      type: TicketType.MAINTENANCE,
      status: TicketStatus.OPEN,
      priority: TicketPriority.CRITICAL,
      category: TicketCategory.PROJECT,
      triageLevel: TriageLevel.CRITICAL,
      loc: { x: 10, y: -2, z: 5 },
      desc: "Kellarin putkistossa merkittävä vuoto. Vaatii välitöntä huomiota.",
    },
    {
      title: "Ulko-oven lukko jumittaa",
      type: TicketType.MAINTENANCE,
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: TicketCategory.MAINTENANCE,
      triageLevel: TriageLevel.ROUTINE,
      loc: { x: 0, y: 0, z: 15 },
      desc: "Pääoven lukko vaatii rasvausta tai vaihtoa.",
    },
    {
      title: "Patteri ei lämpene A2",
      type: TicketType.MAINTENANCE,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.MAINTENANCE,
      triageLevel: TriageLevel.ROUTINE,
      loc: { x: 8, y: 3, z: 2 },
      desc: "Makuuhuoneen patteri on kylmä.",
    },
    {
      title: "Julkisivun halkeama",
      type: TicketType.RENOVATION,
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: TicketCategory.PROJECT,
      triageLevel: TriageLevel.ESCALATED,
      loc: { x: -15, y: 8, z: 0 },
      desc: "Havaittu pystysuuntainen halkeama C-rapun kulmassa.",
      huoltoNotes:
        "Tarkastettu huoltoyhtiön toimesta. Vaatii rakennusinsinöörin arvion.",
    },
  ];

  for (const t of demoTickets) {
    // 1. Create Observation first to hold location and for escalation demo
    const obs = await prisma.observation.create({
      data: {
        housingCompanyId: company.id,
        userId: residentUser.id,
        component: t.title,
        description: t.desc,
        status: "OPEN",
        location: JSON.stringify(t.loc),
      },
    });

    // 2. Create Ticket linked to Observation
    await prisma.ticket.create({
      data: {
        housingCompanyId: company.id,
        createdById: residentUser.id,
        title: t.title,
        description: t.desc,
        type: t.type,
        status: t.status,
        priority: t.priority,
        category: t.category,
        triageLevel: t.triageLevel,
        observationId: obs.id,
        huoltoNotes: t.huoltoNotes || null,
      },
    });
  }

  // 9. Renovations (PTS & History)
  console.log("🏗️ Creating Renovations (PTS & History)...");

  // Completed (History)
  await prisma.renovation.create({
    data: {
      housingCompanyId: company.id,
      component: "Vesikatto",
      yearDone: 2010,
      cost: 45000,
      expectedLifeSpan: 40,
      description: "Huopakaton uusiminen ja lisäeristys.",
      status: "COMPLETED",
    },
  });

  await prisma.renovation.create({
    data: {
      housingCompanyId: company.id,
      component: "Lämmönjakokeskus",
      yearDone: 2018,
      cost: 15000,
      expectedLifeSpan: 20,
      description: "Lämmönsiirtimen uusiminen ja automaation päivitys.",
      status: "COMPLETED",
    },
  });

  // Planned (PTS)
  await prisma.renovation.create({
    data: {
      housingCompanyId: company.id,
      component: "Julkisivuremontti",
      plannedYear: 2027,
      cost: 120000,
      expectedLifeSpan: 30,
      description: "Elementtisaumaukset ja maalaus.",
      status: "PLANNED",
    },
  });

  await prisma.renovation.create({
    data: {
      housingCompanyId: company.id,
      component: "Sähköautojen latausinfra",
      plannedYear: 2026,
      cost: 25000,
      expectedLifeSpan: 15,
      description: "Kartoitus ja vaihe 1 toteutus (4 paikkaa).",
      status: "PLANNED",
    },
  });

  await prisma.renovation.create({
    data: {
      housingCompanyId: company.id,
      component: "Linjasaneeraus (Hankesuunnittelu)",
      plannedYear: 2030,
      cost: 15000,
      expectedLifeSpan: 50,
      description: "Putkiremontin hankesuunnittelun aloitus.",
      status: "PLANNED",
    },
  });

  // 10. Service Book (Huoltokirja) - Mock History via Tickets
  console.log("📘 Creating Service Book Entries...");
  const serviceEntries = [
    {
      title: "Ulko-oven säädöt",
      desc: "Ovisuljin säädetty talviasentoon.",
      date: new Date("2025-11-15"),
    },
    {
      title: "Hiekanpoisto",
      desc: "Piha-alueen hiekanpoisto suoritettu.",
      date: new Date("2025-04-20"),
    },
    {
      title: "Rännien puhdistus",
      desc: "Syksyn lehdet poistettu ränneistä.",
      date: new Date("2025-10-10"),
    },
    {
      title: "Suodattimien vaihto",
      desc: "IV-koneiden suodattimet vaihdettu (kevät).",
      date: new Date("2025-03-05"),
    },
  ];

  for (const entry of serviceEntries) {
    await prisma.ticket.create({
      data: {
        housingCompanyId: company.id,
        createdById: boardUser.id, // Logged by board/manager
        title: entry.title,
        description: entry.desc,
        type: TicketType.MAINTENANCE,
        status: TicketStatus.CLOSED, // Closed = History
        priority: TicketPriority.LOW,
        createdAt: entry.date,
        updatedAt: entry.date,
      },
    });
  }

  // 11. Building Components (Value Intelligence)
  console.log("🏗️ Creating Building Components...");
  await prisma.buildingComponent.create({
    data: {
      housingCompanyId: company.id,
      meshId: "Roof_01",
      name: "Vesikatto (Huopa)",
      type: "ROOF",
      responsibility: "COMPANY",
      lastRenovatedYear: 2010,
      expectedLifespan: 25, // Ends 2035 (10 years left -> WARNING)
      estimatedCostSqm: 60,
    },
  });

  await prisma.buildingComponent.create({
    data: {
      housingCompanyId: company.id,
      meshId: "Facade_01",
      name: "Julkisivu (Betonielementti)",
      type: "FACADE",
      responsibility: "COMPANY",
      lastRenovatedYear: 1985,
      expectedLifespan: 45, // Ends 2030 (4 years left -> CRITICAL)
      estimatedCostSqm: 150,
    },
  });

  await prisma.buildingComponent.create({
    data: {
      housingCompanyId: company.id,
      meshId: "Plumbing_01",
      name: "Putkisto (LVIS)",
      type: "PLUMBING",
      responsibility: "COMPANY",
      lastRenovatedYear: 1985,
      expectedLifespan: 50, // RT-kortisto standard
      estimatedCostSqm: 200,
    },
  });

  await prisma.buildingComponent.create({
    data: {
      housingCompanyId: company.id,
      meshId: "Windows_01",
      name: "Ikkunat (Alumiini)",
      type: "WINDOWS",
      responsibility: "COMPANY",
      lastRenovatedYear: 2005,
      expectedLifespan: 25,
      estimatedCostSqm: 300,
    },
  });

  await prisma.buildingComponent.create({
    data: {
      housingCompanyId: company.id,
      meshId: "HVAC_01",
      name: "LVI-järjestelmä",
      type: "HVAC",
      responsibility: "COMPANY",
      lastRenovatedYear: 2015,
      expectedLifespan: 20,
      estimatedCostSqm: 120,
    },
  });

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
