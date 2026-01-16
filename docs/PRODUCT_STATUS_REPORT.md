# Talovahti Product Status Report & Feature Inventory

**Date:** 2026-01-16
**Version:** 0.1.0-alpha
**Purpose:** Feature screening and prioritization for product launch content planning.

## 📊 Executive Summary

Talovahti has a robust **Database Schema** and **UI Shell**. The "Real" backend logic is implemented for specific high-value workflows (Renovations, Ops Board, Weather), while comprehensive dashboards (Finance, Voting, Strategy) currently run on **Mock Data** (Zustand Store) to demonstrate functionality without full backend integration.

**Ready for Launch:**
*   ✅ **Renovation Notifications**: Full flow (UI -> DB).
*   ✅ **Weather Pulse**: Real-time FMI integration.
*   ✅ **Ops Center**: Ticket escalation workflow (Ticket -> Observation -> Project).
*   ✅ **Mobile Dashboard**: Responsive layout and navigation.

**Requires Backend Integration (Currently Mock):**
*   ⚠️ **Voting**: UI works, but votes do not persist to DB.
*   ⚠️ **Strategy & Finance Dashboards**: Visuals use hardcoded mock data.
*   ⚠️ **Annual Clock**: Visualizes mock tasks, not DB data.
*   ⚠️ **Scanner**: AR view is a client-side simulation.

---

## 🟢 Feature Inventory: Fully Implemented (Production Ready)

These features connect the UI directly to the Database or External APIs.

| Feature Module | Functionality | Implementation Details |
| :--- | :--- | :--- |
| **Maintenance** | **Renovation Notification** | Form submits to `createRenovationNotification` Server Action. Writes to `Ticket`, `Observation`, and `GDPRLog` tables. |
| **Maintenance** | **Ops Board (Kanban)** | `getOpsBoardItems` fetches real Tickets, Observations, and Projects from Prisma. Transitions (`escalateTicket`) perform real DB updates. |
| **Building Physics** | **Pulse Weather** | `PulseHero` calls `getPulseData` Server Action, which fetches live XML from **FMI Open Data API**, parses it, and calculates energy alerts. |
| **Core** | **Database Schema** | Full PostgreSQL schema defined in `prisma/schema.prisma` covering HousingCompany, Users, Tickets, Finance, and Governance. |
| **Core** | **Local Defense** | Husky & Lint-Staged configured to prevent bad commits (Type safety, Linting). |

---

## 🟡 Feature Inventory: Hybrid / Partial Implementation

These features have real database interactions but rely on simulated external adapters or partial logic.

| Feature Module | Functionality | Implementation Details |
| :--- | :--- | :--- |
| **Finance** | **Loan Application** | `submitLoanApplication` saves application data to the Database (`LoanApplication` table), but the **Bank Integration** (`bankBridge`) is currently a simulated adapter. |
| **3D Twin** | **Building Model** | The 3D renderer (`BuildingModel.tsx`) is real (Three.js), but it highlights components based on **Mock Data** from the store/props rather than live DB status. |
| **Strategy** | **Strategy Engine** | The logic (`StrategyEngine.ts`) for calculating scores is real code, but it is currently fed **Mock Data** (`store.finance`) instead of live database aggregates. |

---

## 🔴 Feature Inventory: Mock / Prototype (Needs Development)

These features exist as "UI Shells" powered by `src/lib/store.ts`. They look and feel real but **do not persist data**.

| Feature Module | Functionality | Missing Development Work |
| :--- | :--- | :--- |
| **Governance** | **Digital Voting** | `VotingPage.tsx` uses `useStore` to cast votes locally. **Needs:** Server Action to write to `Vote` table and verify share weights. |
| **Governance** | **Initiatives** | "New Initiative" flow adds to local state only. **Needs:** CRUD Server Actions. |
| **Finance** | **Finance Dashboard** | Graphs (Expenses, Energy) render mock arrays from `store.ts`. **Needs:** Aggregation queries on `BudgetLineItem` and `Invoice` tables. |
| **Strategy** | **Annual Clock** | Visualizes `store.annualTasks` (hardcoded). **Needs:** Fetching `AnnualTask` records from DB based on `FiscalConfiguration`. |
| **Operations** | **Mobile Scanner** | `ScannerPage.tsx` is a pure client-side simulation with random "leak" generation. **Needs:** AR library integration or image upload + CV processing. |
| **Operations** | **Service Marketplace** | Partners list is hardcoded in `store.servicePartners`. **Needs:** DB fetch from `ServicePartner` table. |
| **Reporting** | **PDF Generation** | `generateBoardReport` is a placeholder with a timeout. **Needs:** `react-pdf` or similar implementation to generate actual files. |

---

## 📋 Prioritization Recommendations for Launch

To reach a "Minimum Sellable Product" (MSP), we recommend the following sprint priority:

### Priority 1: Governance Data Binding (High Value)
*   **Why:** Legal compliance and decision-making are core value props.
*   **Task:** Connect `VotingPage` and `AnnualClock` to the existing Prisma schema.

### Priority 2: Finance Data Binding (High Value)
*   **Why:** The "Financial Health Score" is a key differentiator but currently fake.
*   **Task:** Replace `store.finance` mock object with a Server Component data fetch that aggregates real `Invoice` and `BudgetLineItem` data.

### Priority 3: PDF Reporting (Deliverable)
*   **Why:** Boards need to export the "Strategy" view for meetings.
*   **Task:** Implement actual PDF generation in `report.ts`.

### Defer / Post-Launch
*   **AR Scanner**: The "cool factor" is high, but the simulation is sufficient for sales demos. True AR is complex.
*   **Bank Bridge**: The current DB-logging implementation is sufficient for MVP; real banking API integration is a major partnership task.
