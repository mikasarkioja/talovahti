# OpenTaloyhtiö OS: Decentralized Housing Management System

## 🏠 Value Proposition
**OpenTaloyhtiö OS** is an "Isännöitsijä-free" (Property Manager-free), 3D-first platform designed to revolutionize the governance of Finnish Housing Companies (*Asunto-osakeyhtiöt*). 

By digitizing the entire lifecycle of a building—from maintenance history to decision-making—we empower Boards and Residents to manage their property directly, transparently, and cost-effectively. The platform replaces traditional, opaque management models with a modern **Consensus Pipeline** and a **Digital Twin** interface.

## ✨ Key Features

- **3D Digital Twin**: A visual interface built with React Three Fiber, showing real-time status of apartments, maintenance requests, and renovations on a 3D model of the building.
- **Consensus Pipeline**: A Kanban-style governance tool that guides initiatives from "Idea" to "Legally Binding Decision", ensuring compliance with *Asunto-osakeyhtiölaki*.
- **MML Sync**: Automated integration with the National Land Survey of Finland (Maanmittauslaitos) to report renovations and share transfers.
- **Automated Documents**: One-click generation of official documents like the Property Manager's Certificate (*Isännöitsijäntodistus*) and Articles of Association.
- **Accounting API Bridge**: Real-time integration with financial software (mocked Netvisor/Procountor support) for instant budget tracking and invoice approval.
- **Renovation Management**: A decentralized workflow for hiring supervisors and contractors, following YSE 1998 standards.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Styling**: Tailwind CSS v4
- **3D Visualization**: Three.js / React Three Fiber / Drei
- **State Management**: Zustand

## 💰 Business Logic & Revenue Model

The platform operates on a **Dual-Revenue Model**:

1.  **SaaS Subscriptions (Housing Companies)**
    -   **Basic (€49/mo)**: Digital Twin & Board Tools (Limit 20 apts).
    -   **Pro (€149/mo)**: Unlimited Apartments + MML Sync + Accounting Bridge.
    -   **Premium (€299/mo)**: Priority Support + White-labeling.

2.  **Transactional Revenue (Document Sales)**
    -   Automated legal documents (e.g., *Isännöitsijäntodistus*) are sold directly to real estate agents and shareholders.
    -   **100% of this revenue** is retained by the Platform Provider, offsetting the lower SaaS costs for the housing company.

## 🚀 Initial Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/taloyhtio-os.git
    cd taloyhtio-os
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root directory:
    ```env
    # Database (Supabase Connection)
    DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
    
    # Mock Accounting API Configuration
    ACCOUNTING_API_KEY="mock-key-123"
    ACCOUNTING_ENV="sandbox"
    ```

4.  **Database Setup**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the Digital Twin dashboard.

## 🤝 Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
