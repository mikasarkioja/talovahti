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
  ResponsibilityType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Cleanup
  console.log("🧹 Cleaning up old data...");
  try {
    // Delete in order of dependencies (Child-to-Parent)
    await prisma.bidInvitation.deleteMany();
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

    await prisma.stripeTransaction.deleteMany();
    await prisma.order.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.healthHistory.deleteMany();
    await prisma.boardProfile.deleteMany();
    await prisma.buildingComponent.deleteMany();
    await prisma.budgetLineItem.deleteMany();
    await prisma.monthlyFee.deleteMany();
    await prisma.statutoryDocument.deleteMany();
    await prisma.utilityPrice.deleteMany();
    await prisma.servicePartner.deleteMany();
    await prisma.housingCompany.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.expert.deleteMany();
  } catch (e) {
    console.warn("Cleanup warning (tables might be empty):", e);
  }

  // 2. Housing Company
  console.log("🏢 Creating Housing Companies...");
  const company = await prisma.housingCompany.create({
    data: {
      name: "As Oy Säästötalo",
      businessId: "1234567-8",
      address: "Esimerkkikatu 42",
      city: "Helsinki",
      postalCode: "00100",
      constructionYear: 1985,
      totalSqm: 2500.0,
      maintenanceFeePerShare: 4.5,
    },
  });

  const company2 = await prisma.housingCompany.create({
    data: {
      name: "As Oy ModerniTorni",
      businessId: "8765432-1",
      address: "Tulevaisuudenkuja 1",
      city: "Espoo",
      postalCode: "02100",
      constructionYear: 2024,
      totalSqm: 5000.0,
      maintenanceFeePerShare: 5.2,
    },
  });

  // 3. Apartments
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
        sharesStart: 1,
        sharesEnd: 100,
      },
    });
    apartments.push(created);
  }

  // Apartments for Company 2
  const apartments2 = [];
  for (let i = 1; i <= 5; i++) {
    const created = await prisma.apartment.create({
      data: {
        housingCompanyId: company2.id,
        apartmentNumber: `C ${i}`,
        floor: i,
        shareCount: 200,
        area: 110.0,
        sharesStart: 1,
        sharesEnd: 100,
      },
    });
    apartments2.push(created);
  }

  // 4. Users (Board, Shareholders & Resident)
  console.log("👥 Creating Users...");
  const boardUser = await prisma.user.create({
    data: {
      email: "pekka.puheenjohtaja@example.com",
      name: "Pekka Puheenjohtaja",
      role: UserRole.BOARD_MEMBER,
      housingCompanyId: company.id,
      apartmentId: apartments[0].id, // A 1
    },
  });

  const shareholder1 = await prisma.user.create({
    data: {
      email: "osakas1@example.com",
      name: "Outi Osakas",
      role: UserRole.SHAREHOLDER,
      housingCompanyId: company.id,
      apartmentId: apartments[1].id, // A 2
    },
  });

  const shareholder2 = await prisma.user.create({
    data: {
      email: "osakas2@example.com",
      name: "Olli Osakas",
      role: UserRole.SHAREHOLDER,
      housingCompanyId: company.id,
      apartmentId: apartments[2].id, // A 3
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

  // Users for Company 2
  await prisma.user.create({
    data: {
      email: "eeva.edistyksellinen@example.com",
      name: "Eeva Edistyksellinen",
      role: UserRole.BOARD_MEMBER,
      housingCompanyId: company2.id,
      apartmentId: apartments2[0].id, // C 1
    },
  });

  await prisma.user.create({
    data: {
      email: "teemu.testaaja@example.com",
      name: "Teemu Testaaja",
      role: UserRole.RESIDENT,
      housingCompanyId: company2.id,
      apartmentId: apartments2[1].id, // C 2
    },
  });

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
      userId: boardUser.id,
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
  // Shareholders (A2: 150, A3: 150) -> YES
  await prisma.vote.create({
    data: {
      initiativeId: initiative.id,
      userId: shareholder1.id,
      apartmentId: apartments[1].id,
      choice: VoteChoice.YES,
      shares: 150,
    },
  });
  await prisma.vote.create({
    data: {
      initiativeId: initiative.id,
      userId: shareholder2.id,
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

  // 11. Building Components (Value Intelligence & Responsibility)
  console.log("🏗️ Creating Building Components...");
  const components = [
    {
      meshId: "Roof_01",
      name: "Vesikatto",
      type: "ROOF",
      responsibility: ResponsibilityType.COMPANY,
      lastRenovatedYear: 2010,
      expectedLifespan: 25,
      estimatedCostSqm: 60,
    },
    {
      meshId: "Facade_01",
      name: "Julkisivu",
      type: "FACADE",
      responsibility: ResponsibilityType.COMPANY,
      lastRenovatedYear: 1985,
      expectedLifespan: 45,
      estimatedCostSqm: 150,
    },
    {
      meshId: "Windows_01",
      name: "Ikkunat",
      type: "WINDOWS",
      responsibility: ResponsibilityType.COMPANY,
      lastRenovatedYear: 2005,
      expectedLifespan: 25,
      estimatedCostSqm: 300,
    },
    {
      meshId: "Pipes_01",
      name: "Pystyviemärit",
      type: "PLUMBING",
      responsibility: ResponsibilityType.COMPANY,
      lastRenovatedYear: 1985,
      expectedLifespan: 50,
      estimatedCostSqm: 200,
    },
    {
      meshId: "Bathroom_01",
      name: "Kylpyhuoneen pinnat",
      type: "INTERIOR",
      responsibility: ResponsibilityType.SHAREHOLDER,
      lastRenovatedYear: 2020,
      expectedLifespan: 20,
      estimatedCostSqm: 500,
    },
    {
      meshId: "Kitchen_01",
      name: "Keittiökaapistot",
      type: "INTERIOR",
      responsibility: ResponsibilityType.SHAREHOLDER,
      lastRenovatedYear: 2015,
      expectedLifespan: 15,
      estimatedCostSqm: 400,
    },
    {
      meshId: "Floor_01",
      name: "Lattiamateriaalit",
      type: "INTERIOR",
      responsibility: ResponsibilityType.SHAREHOLDER,
      lastRenovatedYear: 2018,
      expectedLifespan: 20,
      estimatedCostSqm: 80,
    },
  ];

  for (const c of components) {
    await prisma.buildingComponent.create({
      data: {
        housingCompanyId: company.id,
        ...c,
      },
    });
  }

  // 12. Active Project with Milestones
  console.log("🏗️ Creating Active Project with Milestones...");
  await prisma.project.create({
    data: {
      housingCompanyId: company.id,
      title: "Julkisivun huoltomaalaus",
      description:
        "Elementtisaumojen uusiminen ja julkisivun pesu sekä maalaus.",
      type: "FACADE",
      status: "EXECUTION",
      estimatedCost: 55000,
      milestones: {
        create: [
          {
            title: "Aloitusmaksu ja materiaalit",
            amount: 15000,
            dueDate: new Date("2026-02-01"),
            status: "PAID",
            isApproved: true,
            isPaid: true,
          },
          {
            title: "Pesu ja hiekkapuhallus valmis",
            amount: 20000,
            dueDate: new Date("2026-03-15"),
            status: "PENDING",
          },
          {
            title: "Loppumaksu ja vastaanotto",
            amount: 20000,
            dueDate: new Date("2026-05-01"),
            status: "PENDING",
          },
        ],
      },
      siteReports: {
        create: [
          {
            authorId: boardUser.id,
            content: "Telineet pystytetty ja työmaa-alue rajattu.",
            imageUrl: "https://placehold.co/600x400/png?text=Telineet",
          },
        ],
      },
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
