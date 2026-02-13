# Changelog

## [Unreleased] - 2026-02-14

### Added
- New fields to `HousingCompany` model: `realTimeCash` and `unpaidInvoicesCount`.
- Professional Finnish translations for dashboard elements.
- New standardized `UserRole` values: `BOARD_MEMBER`, `EXPERT`, `ADMIN`.

### Fixed
- **TypeScript Error**: Resolved `Achievement[]` type overlap error in the Admin Dashboard.
- **Vercel Build Failure**: Fixed `P2022` database error by synchronizing the production database schema with Prisma.
- **RBAC Logic**: Migrated all legacy role checks (`BOARD`, `MANAGER`, `SUPERVISOR`) to the new standardized role system.
- **Null Checks**: Added safety checks for `realTimeCash` and other potentially null fields in engines.
- **Component Fixes**:
  - `PurchaseInvoices.tsx`: Fixed optional description handling and server action arguments.
  - `HomeClient.tsx`: Fixed interface definitions to avoid `any` type linting errors.
  - `BoardCockpit.tsx`: Fixed `PulseItem` interface mismatch.
  - `democracy/page.tsx`: Fixed `Recharts` tooltip type errors.
- **Engines**: Restored `KLOSS_CONSTANT` to `StrategyEngine.ts` for energy impact calculations.

### Removed
- **Dead Code Cleanup**: Removed legacy mock features and stale files:
  - Stale ERP adapters in `src/lib/adapters/`.
  - Mock document marketplace in `src/app/documents/`.
  - Stale energy math logic in `src/lib/energy-math.ts`.
- Legacy user roles from `UserRole` enum.

### Database
- Migrated existing production users from legacy roles to new standardized roles.
- Synchronized Supabase schema with the latest Prisma model using `db push`.
