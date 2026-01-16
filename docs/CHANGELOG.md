# Changelog

## [2026-01-16] - Temporal Engine & Strategic Intelligence

### ⏳ The Temporal Engine
- **Fiscal Year Logic**: Implemented `FiscalConfiguration` and `AnnualTask` models to support non-calendar fiscal years.
- **Annual Clock UI**: Created `AnnualClock.tsx`, an interactive circular visualization of the fiscal year divided into quarters (Q1-Q4).
- **3D Integration**: Tasks in the Annual Clock now visually highlight relevant building components (e.g., Roof, HVAC) in the 3D Digital Twin using the `useTemporalStore`.
- **Statutory Deadlines**: Added logic to automatically calculate deadlines for General Meetings and Financial Statements based on the Housing Companies Act.

### 🧠 Strategic Intelligence
- **Board Dashboard**: Implemented `StrategyDashboard.tsx` specifically for the Board of Directors.
- **Strategy Engine**: Created `StrategyEngine.ts` to calculate:
  - **Financial Health Score (A-E)**: Based on liquidity and loan-to-value ratios.
  - **Maintenance Backlog Index**: Quantifies deferred maintenance risk.
  - **Energy Intensity**: Tracks kWh/m² against 2030 targets.
- **PDF Reporting**: Added a Server Action `generateBoardReport` to generate strategic summary PDFs.

### 🌡️ Pulse & Building Physics
- **Pulse Hero**: A new daily context header component displaying real-time weather and energy impact alerts.
- **Building Physics Engine**: Implemented `BuildingPhysicsEngine.ts` to translate weather data into actionable alerts (e.g., "Critical Energy Impact" at <-15°C, "Snow Removal" at >5cm accumulation).
- **FMI Integration**: Created a Node-safe `FmiService` using `fast-xml-parser` to fetch open data from the Finnish Meteorological Institute.
- **Node-Safe Parsing**: Replaced browser-only `DOMParser` with `XMLParser` to ensure compatibility with Next.js Server Components.

### 📱 Mobile & Web UX
- **Mobile Dashboard**: Launched a dedicated mobile view (`/mobile`) with `ActivityStream`, `SpatialDrawer` (3D mini-map), and `MobileBottomNav`.
- **Web Dashboard**: Integrated `PulseHero`, `AnnualClock`, and `StrategyDashboard` into the main landing page (`src/app/page.tsx`) for a unified experience.
- **Renovation Workflow**: Added `useRenovationStore` and form logic for Shareholder Renovation Notifications ("Osakasmuutostyö"), including 3D location pinning.

### 🛡️ Local Defense & DevOps
- **Husky & Lint-Staged**: Configured pre-commit hooks to enforce ESLint, Prettier, and TypeScript checks (`tsc --noEmit`) on staged files.
- **Next.js 15+ Compatibility**: Fixed dynamic route params handling (awaiting `params`) in `contract` and `tendering` pages.
- **Type Safety**: Ran `prisma generate` and fixed type mismatches in the store and components.

## [2026-01-12] - Deployment & Core Feature Stabilization

### 🏗️ Infrastructure & Build System
- **Prisma Configuration Update**: Resolved persistent Vercel build errors (P1012) by strictly defining the configuration strategy.
  - Downgraded `prisma` and `@prisma/client` from v7.2.0 to v6.0.0 to restore support for `schema.prisma` configuration properties.
  - Removed conflicting `prisma.config.ts`.
  - Restored `url` and `directUrl` env variable references in `schema.prisma`.
  - Simplified `PrismaClient` initialization in `src/lib/db.ts` to rely on standard schema-based configuration.
- **Module Resolution**: Fixed CommonJS/ESM interop issues with `pdf-parse` by switching to `require()` syntax.

### 🏛️ Governance & Decision Pipeline
- **Unified Governance Status**: Refactored the entire proposal workflow to use a consistent `GovernanceStatus` enum (`OPEN_FOR_SUPPORT`, `QUALIFIED`, `VOTING`, `APPROVED`).
- **Kanban Board Update**: Updated `KanbanBoard.tsx` to reflect the new statuses, adding Finnish translations and drag-and-drop support for the new lifecycle.
- **Vote & Archive Views**: Updated logic in `library/page.tsx`, `pipeline/page.tsx`, and `voting/page.tsx` to correctly filter initiatives based on the new status field, removing deprecated `pipelineStage` references.

### 📱 Mobile Experience
- **Mobile-First Navigation**: Implemented a global `BottomNav` component with a dedicated Floating Action Button (FAB) slot.
- **Type Safety**: Improved TypeScript definitions for `TabItem` unions to resolve JSX type errors with Lucide icons.

### 🏢 3D Digital Twin
- **Geometry Fixes**: Corrected `DigitalRain.tsx` BufferAttribute instantiation (`args={[positions, 3]}`) to satisfy `react-three-fiber` type requirements.
- **Stability**: Ensured correct prop passing for 3D visual effects.

### 💶 Finance & Compliance
- **GDPR Audit Logging**: Integrated `GDPRLog` recording into `accounting-provider.ts` for invoice approvals.
- **Type Safety**: Added explicit typing to `mockApartments` in `mml-sync.ts` and fixed icon imports in `BoardCockpit.tsx`.

### 🐛 Bug Fixes
- **Import Errors**: Resolved missing `Zap` icon import in `BoardCockpit`.
- **Type Errors**: Fixed multiple "Property does not exist" errors related to the `pipelineStage` to `status` migration.
