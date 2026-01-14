# Talovahti - The Housing Company Operating System

**Talovahti** (formerly OpenTaloyhtiö OS) is a futuristic, 3D-first platform designed to digitize and automate the management of Finnish Housing Companies (*Asunto-osakeyhtiöt*). It empowers Boards and Shareholders to manage their property transparently, replacing opaque legacy models with real-time data and automated workflows.

## 🚀 Key Modules

### 1. 3D Digital Twin & Operations
*   **Architectural Extruder**: Generates a 3D building model from 2D floor plans using `ExtruderEngine`.
*   **X-Ray Mode**: Visualize internal infrastructure, pipe networks, and apartment stacks.
*   **Energy Heatmap**: Real-time shader visualization of thermal leaks and energy efficiency.
*   **Mobile Scanner (AR)**: A mobile-first "Heads-Up Display" for residents to report observations and leaks by pointing their phone.
*   **IoT Integration**: Smart control for Sauna relays (preheating), water meters, and leak detection sensors (Sentinel/Guardian logic).

### 2. Finance & Automation
*   **Automated Billing Engine**: Calculates and generates monthly maintenance fee invoices (*Hoitovastike*) based on share counts and water advance settings.
*   **Accounting Bridge**: Two-way sync with financial software (mocked Fennoa/Netvisor) to automate accounts receivable and payable.
*   **Bank Bridge**: A "Loan Brokerage" system that bundles Investment Grade data to request competitive loan offers from Finnish banks.
*   **Investment Grade (BIG)**: An algorithm that calculates the "Financial Health Score" (A-E) of the building based on repair debt, savings, and energy efficiency.
*   **Revenue Dashboard**: Real-time gauges for liquidity, collection rates, and budget variance.

### 3. Governance & Democracy
*   **Päätösputki (Decision Pipeline)**: A transparent workflow for moving initiatives from "Proposal" to "Board Vote" to "General Meeting Decision".
*   **Digital Voting**: Weighted voting system based on share counts, supporting strict legal compliance.
*   **Meeting Management**: Automated minutes generation and signature workflows.
*   **Service Marketplace**: A Kanban-style board for hiring pre-vetted service providers (plumbers, cleaners) with "Resident Tasks" (work-for-credit).

### 4. Onboarding & Compliance
*   **Activation Wizard**: A seamless onboarding flow integrated with **Maanmittauslaitos (MML)** to fetch official shareholder and apartment data.
*   **GDPR & Privacy Center**: Built-in "Right to Data Portability" and "Right to Erasure" tools, with strict Audit Logging for board access to sensitive data.
*   **Role-Based Access (RBAC)**: Granular permissions ensuring residents only see their own data while the Board has oversight.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 16 (App Router), React, Tailwind CSS v4 (Nordic Design Tokens), Shadcn UI.
*   **3D Graphics**: Three.js, React Three Fiber, Drei (InstancedMesh, Custom Shaders).
*   **Backend**: Next.js API Routes (Server Actions).
*   **Database**: PostgreSQL (via Supabase), Prisma ORM.
*   **State Management**: Zustand.
*   **Security**: RBAC Middleware, GDPR Logging.

## 📦 Installation

1.  **Clone & Install**
    ```bash
    git clone https://github.com/mikasarkioja/talovahti.git
    cd talovahti
    npm install
    ```

2.  **Environment Setup**
    Create `.env` file:
    ```env
    DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
    DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true"
    ```

3.  **Database Migration**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🔐 Privacy & Security

Talovahti is built with **Privacy by Design**:
*   **Audit Logs**: Every access to sensitive shareholder data by the Board is logged (`GDPRLog`).
*   **Data Sovereignty**: Users can download their full data archive (JSON) at any time.
*   **Anonymization**: "Soft Delete" functionality anonymizes PII while retaining statistical building data.

## 🤝 Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for a detailed history of changes.
