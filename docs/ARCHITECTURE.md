# Talovahti Architecture

## Directory Structure

*   **`src/app`**: Next.js App Router (Pages, Layouts, API Routes).
    *   `admin/`: Board & Manager views (Finance, Ops, Activation).
    *   `finance/`: Resident billing views.
    *   `api/`: Webhooks, GDPR endpoints, Cron jobs.
*   **`src/lib`**: Core Business Logic & Infrastructure.
    *   `engines/`: Complex calculation logic (Risk Analysis, Pricing).
    *   `finance/`: Billing calculators, Accounting sync services.
    *   `onboarding/`: MML Integration, Sync Services.
    *   `three/`: 3D Geometry generation & shaders.
    *   `auth/`: RBAC & Audit logging.
*   **`src/components`**: React UI Components.
    *   `ui/`: Shadcn/Radix primitive components.
    *   `three/`: R3F components (BuildingTwin, Heatmap).
    *   `dashboard/`: Business widgets (Gauges, Charts).
*   **`prisma`**: Database Schema & Seeds.

## Key Architectural Patterns

### 1. Engine Pattern
Complex domain logic is encapsulated in pure TypeScript classes within `src/lib`. These "Engines" are stateless where possible and easy to test.
*   *Examples*: `ExtruderEngine` (3D Geometry), `BillingCalculator` (Finance), `SyncService` (Data Ingestion).

### 2. Server Actions for Mutations
We utilize Next.js Server Actions for form submissions and state mutations (e.g., `activateCompany`, `verifyCompany`). This ensures type safety and reduces client-side JavaScript.

### 3. Transactional Integrity
Critical operations (like Board Activation or Invoice Generation) use `prisma.$transaction` to ensure atomicity. If any step fails (e.g., MML fetch succeeds but DB write fails), the entire operation rolls back.

### 4. Adapter Pattern
Integrations with external systems (Fennoa, Netvisor, MML, IoT) are built behind interfaces/adapters. This allows us to switch providers or use Mock Implementations during development without changing the core application logic.

### 5. Privacy by Design
Data access is governed by the `RBAC` middleware (`src/lib/auth/rbac.ts`). Sensitive operations are wrapped in `withAudit` decorators to ensure GDPR compliance.
