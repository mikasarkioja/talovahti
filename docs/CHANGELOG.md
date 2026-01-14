# Changelog

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
