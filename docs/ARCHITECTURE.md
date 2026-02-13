# Talovahti Architecture

## Directory Structure

*   **`src/app`**: Next.js App Router (Pages, Layouts, API Routes).
    *   `admin/`: Board & Manager views (Finance, Ops, Activation).
    *   `finance/`: Resident billing views.
    *   `api/`: Webhooks, GDPR endpoints, Cron jobs.
    *   `board/`: Special board modules (Marketplace).
*   **`src/lib`**: Core Business Logic & Infrastructure.
    *   `engines/`: Complex calculation logic (Health, Gamification, Strategy, Physics).
    *   `auth/`: RBAC, RoleGates, and GDPR Audit logging.
    *   `services/`: External API clients (Fennoa, FMI, MML).
*   **`src/components`**: React UI Components.
    *   `auth/`: Security components (RoleGate).
    *   `dashboard/`: Business widgets (HealthScore, Gamification, PulseHero).
    *   `finance/`: Financial controls (Guardrail, FennoaCash).

## Key Architectural Patterns

### 1. Engine Pattern
Complex domain logic is encapsulated in pure TypeScript classes within `src/lib/engines`.
*   **`HealthScoreEngine`**: Real-time analysis of building status. Technical score (Observations weighted by severity) and Financial score (Cash-to-Expense ratio).
*   **`GamificationEngine`**: Encapsulates board activity logic. Rewards decision speed and expert usage with XP and Achievements.
*   **`StrategyEngine`**: Calculates long-term KPIs like Maintenance Backlog and Strategic Health Grades (A-E).
*   **`BuildingPhysicsEngine`**: Translates Fmi weather data into real-time building impact alerts.

### 2. Role-Based Access Control (RBAC)
User access is strictly governed by `src/lib/auth/rbac.ts`. 
*   **`RoleGate`**: A UI component that wraps sensitive sections, ensuring Residents cannot see Board XP or Financial data.
*   **Project Isolation**: Experts/Vendors are isolated to observations linked to their projects.

### 3. GDPR by Design
Every sensitive operation (READ/WRITE/EXPORT) is logged via the `RBAC.auditAccess` method to the `GDPRLog` table. This provides a full audit trail for the Board and ensures compliance with EU privacy laws.

### 4. Smart Guardrails
Critical financial and legal actions (e.g., approving invoices > 5000€) are wrapped in the `Guardrail` component. This provides:
*   **Regulatory Alerts**: Reminders of AsOYL (Housing Companies Act) requirements (e.g., 2/3 majority for major investments).
*   **Motivational Guidance**: Suggestions to hire experts from the marketplace when building health is low.

### 5. Transactional Integrity
State mutations (e.g., Expert Ordering or Ticket Escalation) use `prisma.$transaction` to ensure that DB updates and Audit Logs are saved atomically.
