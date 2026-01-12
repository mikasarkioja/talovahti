import { PrismaClient, UserRole, SubscriptionPlan } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('demo2026', 12)

  // 1. Create the Demo Housing Company
  const company = await prisma.housingCompany.upsert({
    where: { businessId: '1234567-8' },
    update: {},
    create: {
      name: 'As Oy Demo-Helsinki',
      businessId: '1234567-8',
      address: 'Esimerkkikatu 1',
      city: 'Helsinki',
      postalCode: '00100',
      subscription: {
        create: {
          plan: 'PRO', // Unlocks MML Sync and Tendering
          status: 'ACTIVE',
          monthlyPrice: 149.00,
          nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
      }
    },
  })

  // 2. Create the Roles
  const users = [
    { email: 'hallitus@demo.fi', role: 'BOARD', name: 'Heikki Hallitus' },
    { email: 'asukas@demo.fi', role: 'RESIDENT', name: 'Antti Asukas' },
    { email: 'valvoja@demo.fi', role: 'SUPERVISOR', name: 'Vesa Valvoja' },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { 
          role: u.role as UserRole,
          password: password, // Update password
          canApproveFinance: u.role === 'BOARD'
      },
      create: {
        email: u.email,
        name: u.name,
        password,
        role: u.role as UserRole,
        housingCompanyId: company.id,
        canApproveFinance: u.role === 'BOARD'
      },
    })
  }

  console.log('✅ Demo environment initialized.')
  console.log('Credentials: [hallitus@demo.fi / asukas@demo.fi] PW: demo2026')
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
