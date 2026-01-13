import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL
})

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Housing Company (East Helsinki 1960s Block)
  const company = await prisma.housingCompany.upsert({
    where: { businessId: '0987654-3' },
    update: {},
    create: {
      businessId: '0987654-3',
      name: 'As Oy Itä-Helsingin Helmi',
      address: 'Meri-Rastilan tie 42',
      city: 'Helsinki',
      postalCode: '00980',
      constructionYear: 1968,
    }
  })

  console.log(`Created Company: ${company.name}`)

  // 2. Create Apartments (72 units: 3 staircases A-C, 8 floors, 3 per floor)
  // Distribution: 
  // 1. 30m2 (1h+k) - 24 units
  // 2. 55m2 (2h+k) - 24 units
  // 3. 78m2 (3h+k) - 24 units
  
  const staircases = ['A', 'B', 'C']
  const floors = 8
  
  for (const stair of staircases) {
    for (let floor = 1; floor <= floors; floor++) {
        const aptNumBase = (staircases.indexOf(stair) * floors * 3) + ((floor - 1) * 3)
        
        // Apt 1: Studio
        await prisma.apartment.create({
            data: {
                housingCompanyId: company.id,
                apartmentNumber: `${stair} ${aptNumBase + 1}`,
                floor: floor,
                area: 30,
                shareCount: 300,
                sharesStart: (aptNumBase * 1000) + 1,
                sharesEnd: (aptNumBase * 1000) + 300
            }
        })

        // Apt 2: 2-room
        await prisma.apartment.create({
            data: {
                housingCompanyId: company.id,
                apartmentNumber: `${stair} ${aptNumBase + 2}`,
                floor: floor,
                area: 55,
                shareCount: 550,
                sharesStart: (aptNumBase * 1000) + 301,
                sharesEnd: (aptNumBase * 1000) + 850
            }
        })

        // Apt 3: 3-room
        await prisma.apartment.create({
            data: {
                housingCompanyId: company.id,
                apartmentNumber: `${stair} ${aptNumBase + 3}`,
                floor: floor,
                area: 78,
                shareCount: 780,
                sharesStart: (aptNumBase * 1000) + 851,
                sharesEnd: (aptNumBase * 1000) + 1630
            }
        })
    }
  }
  console.log('Created 72 Apartments')

  // 3. Create Users (Board & Residents)
  const password = await hash('password123', 10)
  
  // Board Chair (Pekka) - Lives in C 68 (Penthouse-ish)
  const chairApt = await prisma.apartment.findFirst({ where: { apartmentNumber: 'C 68' }})
  await prisma.user.upsert({
    where: { email: 'pekka.pj@esimerkki.fi' },
    update: {},
    create: {
        email: 'pekka.pj@esimerkki.fi',
        name: 'Pekka Puheenjohtaja',
        role: 'BOARD',
        password,
        housingCompanyId: company.id,
        apartmentId: chairApt?.id
    }
  })

  // Active Resident (Maija) - Lives in A 5
  const activeApt = await prisma.apartment.findFirst({ where: { apartmentNumber: 'A 5' }})
  await prisma.user.upsert({
    where: { email: 'maija.meikalainen@esimerkki.fi' },
    update: {},
    create: {
        email: 'maija.meikalainen@esimerkki.fi',
        name: 'Maija Meikäläinen',
        role: 'RESIDENT',
        password,
        housingCompanyId: company.id,
        apartmentId: activeApt?.id
    }
  })

  // Property Manager (Isännöitsijä)
  await prisma.user.upsert({
    where: { email: 'ismo.isannoitsija@toimisto.fi' },
    update: {},
    create: {
        email: 'ismo.isannoitsija@toimisto.fi',
        name: 'Ismo Isännöitsijä',
        role: 'MANAGER',
        password,
        housingCompanyId: company.id
    }
  })

  console.log('Created Users')

  // 4. Financial Statements (History)
  // 1960s building: High heating costs, old loans ending
  await prisma.financialStatement.createMany({
    data: [
        { housingCompanyId: company.id, year: 2023, revenue: 380000, maintenanceFees: 360000, loansTotal: 150000 },
        { housingCompanyId: company.id, year: 2024, revenue: 395000, maintenanceFees: 385000, loansTotal: 120000 }, // Energy crisis impact
        { housingCompanyId: company.id, year: 2025, revenue: 410000, maintenanceFees: 390000, loansTotal: 90000 },
    ]
  })

  // 5. Renovations (PTS History & Future)
  await prisma.renovation.createMany({
    data: [
        { housingCompanyId: company.id, component: 'Vesikatto (Huopa)', yearDone: 1995, cost: 80000, expectedLifeSpan: 30, status: 'COMPLETED' },
        { housingCompanyId: company.id, component: 'Ikkunat (Alkuperäiset)', yearDone: 1968, cost: 0, expectedLifeSpan: 50, status: 'COMPLETED' }, // Overdue!
        { housingCompanyId: company.id, component: 'Lämmönvaihdin', yearDone: 2010, cost: 15000, expectedLifeSpan: 20, status: 'COMPLETED' },
        
        // Upcoming - The Big Ones
        { housingCompanyId: company.id, component: 'LVIS-Saneeraus (Putkiremontti)', plannedYear: 2027, cost: 3500000, expectedLifeSpan: 50, status: 'PLANNED', description: 'Perinteinen menetelmä, sisältää sähköt ja datan.' },
        { housingCompanyId: company.id, component: 'Julkisivuremontti + Ikkunat', plannedYear: 2029, cost: 1200000, expectedLifeSpan: 40, status: 'PLANNED', description: 'Lisälämmöneristys ja uudet ikkunat (Energiaremontti).' },
    ]
  })

  // 6. Cost Benchmarks (KH-Kortti style)
  await prisma.costBenchmark.upsert({ where: { category: 'WINDOWS' }, update: {}, create: { category: 'WINDOWS', unitPriceM2: 450, expectedLifeYears: 40, technicalDepreciationRate: 2.5 }})
  await prisma.costBenchmark.upsert({ where: { category: 'PIPE' }, update: {}, create: { category: 'PIPE', unitPriceM2: 950, expectedLifeYears: 50, technicalDepreciationRate: 2.0 }})
  await prisma.costBenchmark.upsert({ where: { category: 'FACADE' }, update: {}, create: { category: 'FACADE', unitPriceM2: 300, expectedLifeYears: 35, technicalDepreciationRate: 2.8 }})

  // 7. Scenarios (Strategic Simulator)
  // Scenario A: Do nothing until breaks (Disaster)
  await prisma.financialScenario.create({
    data: {
        housingCompanyId: company.id,
        title: 'Skenaario A: Korjaa kun hajoaa',
        totalLoanAmount: 5500000, // Higher due to emergency premiums
        interestRate: 4.5,
        termYears: 25,
        monthlyImpactPerM2: 6.50,
        isBaseline: false
    }
  })

  // Scenario B: Planned (Standard PTS)
  await prisma.financialScenario.create({
    data: {
        housingCompanyId: company.id,
        title: 'Skenaario B: Suunnitelmallinen PTS',
        totalLoanAmount: 4700000,
        interestRate: 3.8,
        termYears: 25,
        monthlyImpactPerM2: 5.20,
        isBaseline: true
    }
  })

  // Scenario C: Smart (Energy savings offset costs)
  await prisma.financialScenario.create({
    data: {
        housingCompanyId: company.id,
        title: 'Skenaario C: Energiaremontti + ARA-avustus',
        totalLoanAmount: 5900000, // Higher capex
        interestRate: 3.5, // Green loan discount
        termYears: 25,
        monthlyImpactPerM2: 4.80, // Lower due to energy savings (-1.5€/m2)
        metadata: JSON.stringify({ energySavings: 25000, araGrant: 400000 })
    }
  })

  console.log('✅ Seed completed successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
