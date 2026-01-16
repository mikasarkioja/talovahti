# Talovahti Architecture

## Directory Structure

*   **`src/app`**: Next.js App Router (Pages, Layouts, API Routes).
    *   `admin/`: Board & Manager views (Finance, Ops, Activation).
    *   `finance/`: Resident billing views.
    *   `api/`: Webhooks, GDPR endpoints, Cron jobs.
    *   `mobile/`: Dedicated mobile dashboard view.
*   **`src/lib`**: Core Business Logic & Infrastructure.
    *   `engines/`: Complex calculation logic (Temporal, Strategy, Physics, Extruder).
    *   `finance/`: Billing calculators, Accounting sync services.
    *   `services/`: External API integrations (FMI, MML).
    *   `three/`: 3D Geometry generation & shaders.
    *   `auth/`: RBAC & Audit logging.
*   **`src/components`**: React UI Components.
    *   `ui/`: Shadcn/Radix primitive components.
    *   `three/`: R3F components (BuildingTwin, Heatmap).
    *   `dashboard/`: Business widgets (AnnualClock, PulseHero, StrategyDashboard).
*   **`prisma`**: Database Schema & Seeds.

## Key Architectural Patterns

### 1. Engine Pattern
Complex domain logic is encapsulated in pure TypeScript classes within `src/lib`. These "Engines" are stateless where possible and easy to test.
*   **`TemporalEngine`**: Maps calendar time to fiscal quarters and statutory deadlines (Housing Companies Act).
*   **`StrategyEngine`**: Calculates KPIs like Financial Health Score (A-E), Maintenance Backlog, and Energy Intensity.
*   **`BuildingPhysicsEngine`**: Translates raw weather data (FMI) into building impact alerts (e.g., Freeze/Thaw cycles, Snow Loads).
*   **`ExtruderEngine`**: Generates 3D building geometry from 2D floor plan metadata.

### 2. Server Actions for Mutations
We utilize Next.js Server Actions for form submissions and state mutations (e.g., `createRenovationNotification`, `getPulseData`). This ensures type safety and reduces client-side JavaScript.

### 3. Transactional Integrity
Critical operations (like Board Activation or Invoice Generation) use `prisma.$transaction` to ensure atomicity. If any step fails (e.g., MML fetch succeeds but DB write fails), the entire operation rolls back.

### 4. Adapter Pattern
Integrations with external systems (Fennoa, Netvisor, MML, IoT) are built behind interfaces/adapters. This allows us to switch providers or use Mock Implementations during development without changing the core application logic.

### 5. Privacy by Design
Data access is governed by the `RBAC` middleware (`src/lib/auth/rbac.ts`). Sensitive operations are wrapped in `withAudit` decorators to ensure GDPR compliance.

### 6. Node-Safe External Integrations
Server-side integrations (like the FMI Weather Service) use `fast-xml-parser` instead of browser-based APIs (`DOMParser`) to ensure compatibility with the Next.js Node.js runtime.
