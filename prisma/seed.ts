import {
  PrismaClient,
  UserRole,
  BudgetCategory,
  TicketStatus,
  TicketPriority,
  TicketType,
  TicketCategory,
  TriageLevel,
  ObservationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Golden Path Seed [cite: 2026-03-15]...");

  // 1. Cleanup
  console.log("🧹 Cleaning up old data...");
  try {
    // Delete in order of dependencies
    await prisma.auditLog.deleteMany();
    await prisma.gDPRLog.deleteMany();
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

    await prisma.annualTask.deleteMany();
    await prisma.strategicGoal.deleteMany();
    await prisma.fiscalConfiguration.deleteMany();

    await prisma.booking.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.powerEvent.deleteMany();

    await prisma.stripeTransaction.deleteMany();
    await prisma.order.deleteMany();
    await prisma.wallet.deleteMany();

    await prisma.shareGroup.deleteMany();
    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.healthHistory.deleteMany();
    await prisma.boardProfile.deleteMany();
    await prisma.statutoryDocument.deleteMany();
    await prisma.utilityPrice.deleteMany();
    await prisma.servicePartner.deleteMany();
    await prisma.housingCompany.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.expert.deleteMany();
  } catch (e) {
    console.warn("Cleanup warning:", e);
  }

  // 2. Housing Company Foundation
  console.log("🏢 Creating 'As Oy Esimerkki-Espoo'...");
  const company = await prisma.housingCompany.create({
    data: {
      name: "As Oy Esimerkki-Espoo",
      businessId: "9876543-2",
      address: "Demokuja 12",
      city: "Espoo",
      postalCode: "02100",
      constructionYear: 1995,
      totalSqm: 3200.0,
      maintenanceFeePerShare: 4.8,
      mmlBuildingId: "100098765B",
      healthScore: 88,
      healthScoreTechnical: 82,
      healthScoreFinancial: 94,
      healthScoreAdmin: 100,
      realTimeCash: 45200.5,
      unpaidInvoicesCount: 0,
    },
  });

  // 3. Apartments
  console.log("🏠 Creating Apartments (2 floors, 5 staircases)...");
  const apartments = [];
  const staircases = ["A", "B", "C", "D", "E"];
  const floors = 2;
  const unitsPerFloor = 3;

  let aptCounter = 0;
  for (const stair of staircases) {
    for (let f = 1; f <= floors; f++) {
      for (let u = 1; u <= unitsPerFloor; u++) {
        const aptNum = (f - 1) * unitsPerFloor + u;
        const apt = await prisma.apartment.create({
          data: {
            housingCompanyId: company.id,
            apartmentNumber: `${stair} ${aptNum}`,
            floor: f,
            shareCount: stair === "A" && aptNum === 12 ? 180 : 120, // Keep A 12 special if it exists
            area: stair === "A" && aptNum === 12 ? 95.5 : 65.0,
            sharesStart: aptCounter * 120 + 1,
            sharesEnd: (aptCounter + 1) * 120,
          },
        });
        apartments.push(apt);
        aptCounter++;
      }
    }
  }
  const aptA12 = apartments.find((a) => a.apartmentNumber === "A 12");
  // If A 12 doesn't exist in 2-story layout, use A 6
  const demoApt =
    aptA12 || apartments.find((a) => a.apartmentNumber === "A 6")!;
  const demoAptNum = demoApt.apartmentNumber;

  // 4. Users (Golden Path Personas)
  console.log("👥 Creating Demo Personas...");
  const liisa = await prisma.user.create({
    data: {
      email: "liisa.puheenjohtaja@example.com",
      name: "Liisa Puheenjohtaja",
      role: UserRole.BOARD_MEMBER,
      housingCompanyId: company.id,
      apartmentId: apartments[0].id, // A 1
      apartmentNumber: apartments[0].apartmentNumber,
      xp: 450,
      canApproveFinance: true,
    },
  });

  const pekka = await prisma.user.create({
    data: {
      email: "pekka.asukas@example.com",
      name: "Pekka Asukas",
      role: UserRole.RESIDENT,
      housingCompanyId: company.id,
      apartmentId: demoApt.id,
      apartmentNumber: demoAptNum,
      xp: 50,
    },
  });

  await prisma.user.create({
    data: {
      email: "matti.urakoitsija@example.com",
      name: "Matti Urakoitsija",
      role: UserRole.EXPERT,
      housingCompanyId: company.id,
    },
  });

  // Board Profile for XP visualization
  await prisma.boardProfile.create({
    data: {
      housingCompanyId: company.id,
      totalXP: 1250,
      level: 3,
      achievements: [
        {
          name: "Nopea Päätöksentekijä",
          description: "Laskut hyväksytty alle 24 tunnissa.",
        },
        {
          name: "Digitaalinen Edelläkävijä",
          description: "HJT2-integraatio otettu käyttöön.",
        },
      ],
    },
  });

  // 5. Historical Context (Closed Tickets)
  console.log("📜 Injecting Historical Context...");
  const historicalTickets = [
    {
      title: "Palaneen lampun vaihto",
      desc: "A-rapun 2. kerroksen käytävävalo pimeänä.",
      date: new Date("2026-01-10"),
    },
    {
      title: "Pihaportin voitelu",
      desc: "Portti narisee avattaessa.",
      date: new Date("2026-02-05"),
    },
  ];

  for (const t of historicalTickets) {
    await prisma.ticket.create({
      data: {
        housingCompanyId: company.id,
        createdById: liisa.id,
        title: t.title,
        description: t.desc,
        status: TicketStatus.CLOSED,
        priority: TicketPriority.LOW,
        type: TicketType.MAINTENANCE,
        createdAt: t.date,
        updatedAt: t.date,
      },
    });
  }

  // 6. The "Critical Case" (Golden Path)
  console.log(`🚨 Injecting the 'Critical Case' (${demoAptNum})...`);
  const criticalObs = await prisma.observation.create({
    data: {
      housingCompanyId: company.id,
      userId: pekka.id,
      component: "Keittiön lattia ja putkisto",
      description:
        "Vettä valuu keittiön kaapiston alta lattialle. Parketti alkaa tummua.",
      status: ObservationStatus.OPEN,
      location: JSON.stringify({ x: 5, y: 3, z: 2, aptId: demoApt.id }),
      severityGrade: 5,
      technicalVerdict: "Välitön vesivahingon riski.",
    },
  });

  await prisma.ticket.create({
    data: {
      housingCompanyId: company.id,
      createdById: pekka.id,
      apartmentId: demoApt.id,
      observationId: criticalObs.id,
      title: `Vesivuoto asunnossa ${demoAptNum}`,
      description: "Vettä valuu keittiön kaapiston alta lattialle.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.CRITICAL,
      triageLevel: TriageLevel.CRITICAL,
      category: TicketCategory.MAINTENANCE,
      unitIdentifier: demoAptNum,
      huoltoNotes:
        "Todennäköinen astianpesukoneen liitoksen murtuma. Vaatii välittömän kosteusmittauksen ja putkimiehen.",
    },
  });

  // 7. Audit Trail
  console.log("📑 Logging Audit Trail...");
  await prisma.auditLog.createMany({
    data: [
      {
        userId: liisa.id,
        action: "Järjestelmä alustettu demotilaan",
        impactScore: 0,
        timestamp: new Date("2026-03-15T08:00:00Z"),
      },
      {
        userId: pekka.id,
        action: `Asukas Pekka jätti vikailmoituksen ${demoAptNum}`,
        targetId: demoApt.id,
        impactScore: 50,
        timestamp: new Date("2026-03-15T09:30:00Z"),
      },
    ],
  });

  // 8. Financial Foundation
  console.log("💰 Creating Budget Line Items...");
  const categories = Object.values(BudgetCategory);
  for (const cat of categories) {
    await prisma.budgetLineItem.create({
      data: {
        housingCompanyId: company.id,
        category: cat,
        year: 2026,
        budgetedAmount: 15000,
        actualSpent: 2450,
      },
    });
  }

  console.log("✅ Golden Path Seed Completed!");
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
