# Talovahti Technical Documentation

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Server Actions](#server-actions)
6. [3D Rendering System](#3d-rendering-system)
7. [External Integrations](#external-integrations)
8. [Security & Compliance](#security--compliance)
9. [Deployment](#deployment)
10. [Development Guide](#development-guide)

---

## System Architecture

### High-Level Overview

Talovahti is a **Next.js 16** full-stack application built with the App Router pattern. It follows a **3-tier architecture**:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components, 3D Canvas, UI)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (Server Actions, API Routes, Engines)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Data Layer                      │
│  (PostgreSQL via Prisma, External APIs) │
└─────────────────────────────────────────┘
```

### Directory Structure

```
taloyhtio-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── actions/           # Server Actions (mutations)
│   │   ├── api/               # API Routes (REST endpoints)
│   │   ├── admin/             # Board/Manager views
│   │   ├── finance/           # Financial views
│   │   ├── maintenance/      # Maintenance workflows
│   │   ├── governance/        # Voting & decisions
│   │   └── mobile/            # Mobile-optimized views
│   ├── components/            # React components
│   │   ├── ui/                # Shadcn/Radix primitives
│   │   ├── three/             # 3D components (R3F)
│   │   ├── dashboard/         # Business widgets
│   │   └── reports/           # PDF generation
│   ├── lib/                    # Core business logic
│   │   ├── engines/           # Calculation engines
│   │   ├── finance/           # Billing & accounting
│   │   ├── services/          # External API clients
│   │   ├── three/             # 3D geometry generation
│   │   ├── auth/              # RBAC & audit
│   │   └── mml/               # HTJ2 integration
│   └── middleware.ts          # Route protection
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts               # Seed data
│   └── test-connection.ts    # Connection testing
└── docs/                      # Documentation
```

### Key Architectural Patterns

#### 1. Engine Pattern
Complex domain logic is encapsulated in stateless TypeScript classes:

- **`TemporalEngine`**: Fiscal year mapping, statutory deadlines
- **`StrategyEngine`**: Financial health scoring (A-E), KPI calculations
- **`BuildingPhysicsEngine`**: Weather impact analysis, energy predictions
- **`ExtruderEngine`**: 3D geometry generation from 2D floor plans
- **`RiskEngine`**: Investment grade calculation, loan risk analysis

#### 2. Server Actions Pattern
All mutations use Next.js Server Actions for type safety and reduced client-side JS:

```typescript
// Example: src/app/actions/renovation.ts
"use server";
export async function createRenovationNotification(data: RenovationData) {
  // Type-safe server-side mutation
}
```

#### 3. Adapter Pattern
External integrations are abstracted behind adapters:

- **`FennoaAdapter`**: Accounting software integration
- **`BankBridge`**: Loan brokerage API abstraction
- **`HTJ2Client`**: MML API client with mTLS

#### 4. Shadow Database Pattern
For HTJ2 integration, raw API responses are stored in `HTJ_ShadowRecord` for compliance and delta comparison.

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework, App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Shadcn UI** | Latest | Component library (Radix UI) |
| **Framer Motion** | 12.26.2 | Animations |
| **Recharts** | 3.6.0 | Data visualization |
| **Zustand** | 5.0.9 | Client-side state management |

### 3D Graphics

| Technology | Version | Purpose |
|------------|---------|---------|
| **Three.js** | 0.182.0 | 3D rendering engine |
| **React Three Fiber** | 9.5.0 | React renderer for Three.js |
| **Drei** | 10.7.7 | R3F helpers (InstancedMesh, etc.) |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js Server Actions** | Built-in | Type-safe mutations |
| **Prisma ORM** | 6.19.2 | Database ORM |
| **PostgreSQL** | Latest | Primary database (via Supabase) |
| **Node.js** | 20+ | Runtime environment |

### External Services

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL hosting, connection pooling |
| **Vercel** | Hosting, CI/CD, edge functions |
| **FMI Open Data** | Weather API (XML) |
| **MML HTJ2** | Official housing company data (mTLS) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Husky** | Git hooks |
| **Lint-Staged** | Pre-commit checks |
| **TypeScript** | Static type checking |

---

## Database Schema

### Core Models

#### HousingCompany
Central entity representing a housing company (Asunto-osakeyhtiö).

**Key Fields:**
- `businessId` (String, unique): Y-tunnus
- `name`, `address`, `city`, `postalCode`
- `constructionYear`, `totalSqm`
- `maintenanceFeePerShare`, `financeFeePerShare`

**Relations:**
- `apartments`, `users`, `tickets`, `renovations`
- `budgetLines`, `invoices`, `initiatives`
- `buildingComponents`, `htjShadowRecords`

#### User
Represents shareholders, board members, and residents.

**Roles:**
- `RESIDENT`: Basic access
- `BOARD`: Board member privileges
- `MANAGER`: Property manager access

#### Apartment
Individual apartment units with share allocation.

**Key Fields:**
- `apartmentNumber`: e.g., "A 12"
- `floor`, `area`, `shareCount`
- `sharesStart`, `sharesEnd`: Share range

#### Ticket
Maintenance requests and issues.

**Status Flow:**
```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

**Types:**
- `MAINTENANCE`, `RENOVATION`, `COMPLAINT`, `OBSERVATION`

#### Renovation
Planned or completed renovation projects.

**Key Fields:**
- `component`: e.g., "ROOF", "PLUMBING"
- `yearDone`, `plannedYear`
- `cost`, `expectedLifeSpan`
- `status`: `PLANNED`, `IN_PROGRESS`, `COMPLETED`

#### BuildingComponent
Technical building components with lifecycle tracking.

**Key Fields:**
- `type`: `ROOF`, `FACADE`, `PLUMBING`, `HVAC`, `WINDOWS`
- `lastRenovatedYear`, `expectedLifespan`
- `estimatedCostSqm`

### Financial Models

#### Invoice
Monthly maintenance fee invoices.

**Status:**
- `DRAFT`, `SENT`, `PAID`, `OVERDUE`

#### BudgetLineItem
Annual budget categories.

**Categories:**
- `MAINTENANCE`, `UTILITIES`, `INSURANCE`, `ADMINISTRATION`, etc.

#### LoanApplication
Loan applications submitted to banks.

**Status:**
- `DRAFT`, `SUBMITTED`, `OFFER_RECEIVED`, `ACCEPTED`, `REJECTED`

### Governance Models

#### Initiative
Proposals for general meetings.

**Status:**
- `DRAFT`, `PROPOSED`, `VOTING`, `APPROVED`, `REJECTED`

#### Vote
Weighted votes based on share counts.

**Choice:**
- `YES`, `NO`, `ABSTAIN`

### Compliance Models

#### GDPRLog
Audit trail for sensitive data access.

**Fields:**
- `userId`, `action`, `piiFieldsAccessed`, `metadata`

#### HTJ_ShadowRecord
Raw MML API responses for compliance.

**Record Types:**
- `YHTIO`, `OSAKERYHMA`, `ILMOITUS`

#### HTJ_SyncLog
HTJ2 operation audit logs.

**Operations:**
- `SYNC_YHTIO`, `SYNC_OSAKERYHMAT`, `SUBMIT_RENOVATION`, `COMPARE_DELTA`

### Full Schema Reference

See `prisma/schema.prisma` for complete schema definition with all fields, relations, and indexes.

---

## API Reference

### Server Actions

Server Actions are located in `src/app/actions/` and are called directly from client components.

#### Maintenance Actions

**`createRenovationNotification`** (`renovation.ts`)
- Creates a renovation ticket with observation
- Logs GDPR access
- Returns created ticket ID

**`escalateTicket`** (`ops-actions.ts`)
- Escalates ticket to observation or project
- Updates ticket status
- Creates related records

#### Financial Actions

**`getFinanceAggregates`** (`finance.ts`)
- Aggregates invoice data by category
- Calculates budget variance
- Returns monthly trends and health score

**`submitLoanApplication`** (`loan-actions.ts`)
- Generates loan packet
- Submits to multiple banks
- Saves applications to database

#### Governance Actions

**`castVote`** (`governance.ts`)
- Records weighted vote
- Validates share ownership
- Prevents duplicate votes

**`getAnnualClockData`** (`governance.ts`)
- Fetches annual tasks by fiscal year
- Groups by month
- Returns completion statistics

#### HTJ2 Integration Actions

**`syncHousingCompany`** (`htj-sync.ts`)
- Syncs data from MML `/yhtiot/` and `/osakeryhmat/` endpoints
- Stores in shadow database
- Maps to local models (non-destructive)

**`compareHTJState`** (`htj-sync.ts`)
- Calculates delta between local DB and shadow records
- Returns mismatches and missing records

**`submitRenovationToHTJ`** (`htj-sync.ts`)
- Submits renovation notification to MML
- Mandatory for 2026+ renovations
- Stores submission in shadow database

#### Valuation Actions

**`getBuildingValueMetrics`** (`valuation.ts`)
- Calculates PKI, KAI, RDR, PH metrics
- Estimates market value
- Returns risk-adjusted building value

### API Routes

API routes are located in `src/app/api/` and follow REST conventions.

#### GDPR Endpoints

**`GET /api/gdpr/export`**
- Exports all user data as JSON
- Includes all related records

**`POST /api/gdpr/delete`**
- Anonymizes user data
- Soft delete with PII removal

#### Webhooks

**`POST /api/webhooks/fennoa`**
- Receives accounting sync webhooks
- Updates invoice status
- Syncs financial data

#### Loan Brokerage

**`POST /api/loan-brokerage/initiate`**
- Initiates loan application process
- Fetches company data via adapter
- Calculates risk analysis

#### Document Orders

**`POST /api/documents/order`**
- Creates document order
- Generates payment link
- Returns order ID

#### Cron Jobs

**`GET /api/cron/sauna-start`**
- Scheduled task for sauna reservations
- Updates booking status

---

## Server Actions

### Complete List

| Action | File | Purpose |
|--------|------|---------|
| `createRenovationNotification` | `renovation.ts` | Create renovation ticket |
| `escalateTicket` | `ops-actions.ts` | Escalate to observation/project |
| `getFinanceAggregates` | `finance.ts` | Financial data aggregation |
| `submitLoanApplication` | `loan-actions.ts` | Submit loan to banks |
| `castVote` | `governance.ts` | Record weighted vote |
| `getAnnualClockData` | `governance.ts` | Fetch annual tasks |
| `syncHousingCompany` | `htj-sync.ts` | Sync MML data |
| `compareHTJState` | `htj-sync.ts` | Compare local vs HTJ |
| `submitRenovationToHTJ` | `htj-sync.ts` | Submit to MML |
| `getBuildingValueMetrics` | `valuation.ts` | Calculate TCO metrics |
| `getPulseData` | `pulse.ts` | Fetch weather data |
| `syncProjectWorkflow` | `workflow-actions.ts` | Auto-sync project state |

### Usage Pattern

```typescript
// Client Component
"use client";
import { createRenovationNotification } from "@/app/actions/renovation";

export function RenovationForm() {
  const handleSubmit = async (data: FormData) => {
    const result = await createRenovationNotification(data);
    if (result.success) {
      // Handle success
    }
  };
}
```

---

## 3D Rendering System

### Architecture

The 3D system uses **React Three Fiber** (R3F) to render Three.js scenes in React.

### Key Components

#### BuildingModel (`src/components/BuildingModel.tsx`)
Main 3D scene container.

**Features:**
- Camera controls (OrbitControls)
- View modes: `NORMAL`, `LIFESPAN`, `VALUE_HEATMAP`
- HUD overlays
- Apartment selection

#### ApartmentMesh (`src/components/three/ApartmentMesh.tsx`)
Individual apartment unit rendering.

**Features:**
- Extruded geometry from floor plans
- Color coding by status
- Emissive glow for heatmap mode
- Click handlers

#### ExtruderEngine (`src/lib/three/ExtruderEngine.ts`)
Generates 3D geometry from 2D polygon points.

**Process:**
1. Takes polygon points from `ApartmentLayout`
2. Creates THREE.Shape
3. Extrudes with height
4. Returns geometry and material settings

### View Modes

#### Normal Mode
Default view with standard apartment colors.

#### Lifespan Mode
Color-codes components by remaining lifespan:
- **Red**: <5 years (CRITICAL)
- **Yellow**: 5-15 years (WARNING)
- **Green**: >15 years (HEALTHY)

#### Value Heatmap Mode
Color-codes by component age (PKI-based):
- **Bright Green**: <10 years (newly renovated)
- **Yellow**: 10-30 years
- **Orange**: 30-40 years
- **Red**: >40 years (very old)

### Performance Optimizations

- **InstancedMesh**: For rendering multiple similar apartments
- **LOD (Level of Detail)**: Simplified geometry at distance
- **Frustum Culling**: Only render visible objects

---

## External Integrations

### FMI Weather Service

**Purpose:** Real-time weather data for building physics calculations.

**Implementation:**
- `src/lib/services/fmiService.ts`
- Fetches XML from FMI Open Data API
- Parses with `fast-xml-parser`
- Returns temperature and snow depth forecasts

**Usage:**
```typescript
import { getPulseData } from "@/app/actions/pulse";
const pulse = await getPulseData(companyId);
```

### MML HTJ2 Integration

**Purpose:** Official housing company data from Maanmittauslaitos.

**Implementation:**
- `src/lib/mml/htj-client.ts`: mTLS client
- `src/lib/mml/audit-wrapper.ts`: GDPR audit logging
- `src/app/actions/htj-sync.ts`: Sync actions

**Endpoints:**
- `/yhtiot/{businessId}`: Company data
- `/osakeryhmat?yhtio={businessId}`: Apartment groups
- `/ilmoitukset/kunnossapito`: Renovation submissions

**Security:**
- Mutual TLS (mTLS) authentication
- Client certificates required
- All operations logged for GDPR compliance

### Accounting Software Integration

**Adapters:**
- `FennoaAdapter`: Fennoa integration
- `NetvisorAdapter`: Netvisor integration (planned)

**Features:**
- Two-way sync (invoices, payments)
- Webhook support
- Automatic reconciliation

### Bank Integration

**Implementation:**
- `src/lib/bank-bridge.ts`
- Generates loan application packets
- Submits to multiple banks
- Tracks offers and status

**Currently:** Mock implementation for MVP

---

## Security & Compliance

### Authentication & Authorization

**RBAC Middleware** (`src/lib/auth/rbac.ts`)
- Role-based access control
- Route protection
- Permission checking

**Roles:**
- `RESIDENT`: Basic read access
- `BOARD`: Full company access
- `MANAGER`: Administrative access

### GDPR Compliance

**Audit Logging** (`src/lib/auth/audit.ts`)
- All sensitive data access logged
- PII field tracking
- Automatic extraction from API responses

**GDPR Endpoints:**
- `/api/gdpr/export`: Data portability
- `/api/gdpr/delete`: Right to erasure

**HTJ2 Audit:**
- All MML API operations logged
- Board member tracking
- PII field extraction

### Data Protection

**Shadow Database:**
- Raw API responses stored for compliance
- Delta comparison for audit
- Historical record keeping

**Soft Delete:**
- Anonymization instead of hard delete
- Retains statistical data
- Removes PII

### Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **mTLS**: Required for production MML API
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection**: Prisma ORM prevents SQL injection
5. **XSS Protection**: React auto-escapes by default
6. **CSRF Protection**: Next.js built-in CSRF tokens

---

## Deployment

### Vercel Deployment

**Automatic:**
- Pushes to `main` branch trigger deployment
- Preview deployments for PRs

**Environment Variables:**
- Set in Vercel Dashboard
- Required: `DATABASE_URL`, `DIRECT_URL`
- Optional: `MML_CLIENT_CERT_PATH`, etc.

**See:** `docs/VERCEL_ENV_SETUP.md` for detailed setup

### Database Migrations

**Development:**
```bash
npx prisma migrate dev
```

**Production:**
```bash
npx prisma migrate deploy
```

**Note:** Vercel doesn't run migrations automatically. Use Supabase migrations or manual deployment.

### Build Process

1. **Install Dependencies**: `npm install`
2. **Generate Prisma Client**: `prisma generate` (postinstall hook)
3. **Type Check**: `tsc --noEmit`
4. **Lint**: `eslint`
5. **Build**: `next build`
6. **Deploy**: Vercel handles deployment

### Environment-Specific Configuration

**Development:**
- Uses `.env` file
- Local database connection
- Mock external services (optional)

**Production:**
- Uses Vercel environment variables
- Production database
- Real external API integrations

---

## Development Guide

### Prerequisites

- **Node.js**: 20.x or higher
- **PostgreSQL**: Via Supabase or local instance
- **Git**: For version control

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/mikasarkioja/talovahti.git
   cd taloyhtio-os
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   Navigate to `http://localhost:3000`

### Development Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |
| `npx tsx prisma/test-connection.ts` | Test database connection |

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: Auto-format on save
- **Husky**: Pre-commit hooks for quality checks

### Testing Database Connection

```bash
npx tsx prisma/test-connection.ts
```

Expected output:
```
🔌 Testing Database Connection...
   URL Host: ...db.xxx.supabase.co:5432
✅ Connection Successful! Found X housing companies.
```

### Common Development Tasks

#### Adding a New Server Action

1. Create file in `src/app/actions/`
2. Add `"use server"` directive
3. Export async function
4. Use Prisma for database operations
5. Return typed result

#### Adding a New API Route

1. Create file in `src/app/api/[route]/route.ts`
2. Export `GET`, `POST`, etc. functions
3. Use `NextRequest` and `NextResponse`
4. Handle errors gracefully

#### Adding a New Database Model

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name [description]`
3. Run `npx prisma generate`
4. Update TypeScript types automatically

### Troubleshooting

**Database Connection Issues:**
- See `docs/TROUBLESHOOTING_DB_CONNECTION.md`

**Build Errors:**
- Check TypeScript errors: `npx tsc --noEmit`
- Check linting: `npm run lint`
- Verify Prisma client: `npx prisma generate`

**3D Rendering Issues:**
- Check browser console for WebGL errors
- Verify Three.js version compatibility
- Check R3F component props

---

## Additional Resources

- **Architecture Details**: `docs/ARCHITECTURE.md`
- **Product Status**: `docs/PRODUCT_STATUS_REPORT.md`
- **HTJ2 Integration**: `docs/HTJ2_INTEGRATION.md`
- **Vercel Setup**: `docs/VERCEL_ENV_SETUP.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING_DB_CONNECTION.md`
- **Changelog**: `docs/CHANGELOG.md`

---

**Last Updated:** 2026-01-16  
**Version:** 0.1.0-alpha
