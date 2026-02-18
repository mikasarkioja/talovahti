import { create } from "zustand";
// ValuationData is now fetched client-side via getBuildingValueMetrics
// import { ValuationData } from "@/app/actions/valuation";
import {
  GovernanceStatus,
  TicketStatus,
  TicketPriority,
  VoteChoice,
  UserRole,
  TicketType,
  TicketCategory,
  TriageLevel,
  RenovationStatus,
  ObservationStatus,
  ProjectStatus,
  TenderType,
  TenderStatus,
  ChangeOrderStatus,
  DocumentType,
  OrderStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  OrderType,
  InvoiceStatus,
  BudgetCategory,
  AnnualTask,
  FiscalConfiguration,
  StrategicGoal,
  GoalStatus,
  MilestoneStatus,
} from "@prisma/client";

// ... (Existing Type Definitions)

export type MockUser = {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  apartmentId: string | null;
  apartmentNumber?: string | null;
  housingCompanyId: string;
  shareCount: number;
  personalDebtShare?: number;
  personalBalanceStatus?: "OK" | "OVERDUE";
  canApproveFinance: boolean;
};

export type MockInitiative = {
  id: string;
  title: string;
  description: string;
  status: GovernanceStatus;
  affectedArea?: string | null;
  authorId: string;
  votes: Array<{
    userId: string;
    choice: VoteChoice;
    shares: number;
    apartment?: { apartmentNumber: string }; // Added for 3D mapping
    apartmentId?: string; // Original CUID
  }>;
  createdAt: Date;
};

export type MockTicket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  category: TicketCategory;
  triageLevel: TriageLevel;
  apartmentId: string | null;
  createdAt: Date;
  date?: Date; // Added for Kanban compatibility
  createdById?: string;
  observationId?: string;
};

export type MockFeedItem = {
  id: string;
  type: "DECISION" | "ANNOUNCEMENT" | "INVOICE_APPROVED";
  title: string;
  date: Date;
  content: string;
};

export type MockFinance = {
  monthlyIncome: number;
  monthlyTarget: number;
  reserveFund: number;
  realTimeCash: number; // Fennoa Real-time Cash
  unpaidInvoicesCount: number;
  budgetRemaining: number;
  energyCostDiff: number;
  collectionPercentage: number;
  companyLoansTotal: number;
  energySavingsPct: number;
  monthlyTrend?: Array<{ month: string; amount: number }>; // Added for real data binding
  score?: string; // Strategic Grade (A-E)
  utilization?: number; // Budget utilization %
};

export type MockRenovation = {
  id: string;
  component: string;
  yearDone?: number;
  plannedYear?: number;
  cost: number;
  expectedLifeSpan: number;
  description: string | null;
  status: RenovationStatus;
};

export type MockSolutionOption = {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  lifeSpanExtension: number;
};

export type MockAssessment = {
  id: string;
  severityGrade: number;
  technicalVerdict: string;
  recommendedYear?: number;
  options?: MockSolutionOption[];
};

export type MockObservation = {
  id: string;
  component: string;
  description: string;
  imageUrl?: string | null;
  status: ObservationStatus;
  location: string | null;
  userId: string;
  assessment?: MockAssessment;
  createdAt: Date;
  severityGrade?: number; // Added for verified workflow
  technicalVerdict?: string | null; // Added for verified workflow
  boardSummary?: string | null; // Added for verified workflow
  projectId?: string | null; // Added for verified workflow
};

export type MockBid = {
  id: string;
  tenderId: string;
  companyName: string;
  price: number;
  startDate: Date;
  endDate: Date;
  creditRating: string;
  residentRating?: number;
  siteVisitsPerWeek?: number;
  livePhotosEnabled: boolean;
  notes?: string;
  isWinner: boolean;
};

export type MockTender = {
  id: string;
  projectId: string;
  type: TenderType;
  status: TenderStatus;
  bids: MockBid[];
  createdAt: Date;
};

export type MockSiteReport = {
  id: string;
  projectId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  timestamp: Date;
};

export type MockChangeOrder = {
  id: string;
  projectId: string;
  title: string;
  costImpact: number;
  status: ChangeOrderStatus;
  createdAt: Date;
};

export type MockMilestone = {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  dueDate: Date;
  status: MilestoneStatus;
};

export type MockProject = {
  id: string;
  title: string;
  type: string;
  status: ProjectStatus;
  tenders: MockTender[];
  siteReports: MockSiteReport[];
  changeOrders: MockChangeOrder[];
  milestones: MockMilestone[];
  createdAt: Date;
  warrantyEndDate?: Date;
  estimatedCost?: number;
  description: string | null;
};

export type MockMMLSyncLog = {
  id: string;
  status: "SUCCESS" | "FAILED";
  recordCount: number;
  timestamp: Date;
};

export type MockSubscription = {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyPrice: number; // New field
  expiresAt: Date | null;
  nextBillingDate: Date | null; // New field
};

export type MockFeatureAccess = {
  id: string;
  key: string;
  name: string;
  description: string;
  price: number;
  isEnabled: boolean;
};

export type MockOrder = {
  id: string;
  userId: string;
  type: OrderType;
  amount: number;
  platformRevenue: number; // New field
  status: OrderStatus;
  metadata?: string;
  createdAt: Date;
};

export type MockInvoice = {
  id: string;
  externalId: string | null;
  yTunnus: string | null;
  vendorName: string;
  description: string | null;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
  category: BudgetCategory;
  projectId: string | null;
  approvedById: string | null;
  imageUrl: string | null;
  createdAt: Date;
  isExternal?: boolean; // Added for Fennoa mock
  invoiceNumber?: string; // Added for Fennoa mock
};

export type MockBudgetLine = {
  id: string;
  category: BudgetCategory;
  budgetedAmount: number;
  actualSpent: number;
  year: number;
};

export type MockVendorRule = {
  id: string;
  yTunnus: string | null;
  vendorName: string | null;
  category: BudgetCategory;
  createdAt: Date;
};

export type MockServicePartner = {
  id: string;
  name: string;
  category: string; // PartnerCategory
  rating: number;
  verified: boolean;
  phone: string;
};

// New Types
export type MockSystemAdminStats = {
  mrr: number;
  totalTransactionRevenue: number;
  activeCompanies: number;
  certificatesSold: number;
};

interface AppState {
  currentUser: MockUser | null;
  housingCompany: {
    id: string;
    healthScore?: number;
    healthScoreTechnical?: number;
    healthScoreFinancial?: number;
    unpaidInvoicesCount?: number;
    realTimeCash?: number;
  } | null;
  initiatives: MockInitiative[];
  tickets: MockTicket[];
  feed: MockFeedItem[];
  finance: MockFinance;
  renovations: MockRenovation[];
  observations: MockObservation[];
  projects: MockProject[];
  mmlSyncLogs: MockMMLSyncLog[];
  subscription: MockSubscription;
  featureAccess: MockFeatureAccess[];
  orders: MockOrder[];
  invoices: MockInvoice[];
  budgetLines: MockBudgetLine[];
  vendorRules: MockVendorRule[];
  servicePartners: MockServicePartner[];

  // New State
  annualTasks: AnnualTask[];
  strategicGoals: StrategicGoal[];
  fiscalConfig: FiscalConfiguration | null;
  apartmentCount: number;
  systemStats: MockSystemAdminStats;

  // Actions
  setCurrentUser: (user: MockUser | null) => void;
  addInitiative: (initiative: MockInitiative) => void;
  updateInitiativeStatus: (id: string, status: GovernanceStatus) => void;
  castVote: (
    initiativeId: string,
    userId: string,
    choice: VoteChoice,
    shares: number,
  ) => void;
  addTicket: (ticket: MockTicket) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  addObservation: (observation: MockObservation) => void;
  addAssessment: (observationId: string, assessment: MockAssessment) => void;
  addSolutionOption: (
    observationId: string,
    option: MockSolutionOption,
  ) => void;
  addProject: (project: MockProject) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  addTender: (projectId: string, tender: MockTender) => void;
  addBid: (tenderId: string, bid: MockBid) => void;
  selectWinnerBid: (projectId: string, tenderId: string, bidId: string) => void;
  addSiteReport: (report: MockSiteReport) => void;
  updateChangeOrder: (id: string, status: ChangeOrderStatus) => void;
  updateMilestoneStatus: (
    projectId: string,
    milestoneId: string,
    status: MilestoneStatus,
  ) => void;
  completeProjectInStore: (projectId: string, warrantyEndDate: Date) => void;
  addMMLSyncLog: (log: MockMMLSyncLog) => void;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  toggleFeature: (key: string, isEnabled: boolean) => void;
  addOrder: (order: MockOrder) => void;
  syncInvoices: (invoices: MockInvoice[]) => void;
  updateInvoiceStatus: (
    id: string,
    status: InvoiceStatus,
    approvedById?: string,
  ) => void;
  addVendorRule: (rule: MockVendorRule) => void;
  updateInvoiceCategory: (id: string, category: BudgetCategory) => void;
  hydrate: (data: Partial<AppState>) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: {
    id: "user-board-1",
    name: "Pekka Puheenjohtaja",
    role: "BOARD_MEMBER",
    apartmentId: "B 10",
    housingCompanyId: "company-1",
    shareCount: 150,
    personalDebtShare: 0,
    personalBalanceStatus: "OK",
    canApproveFinance: true,
  },
  housingCompany: null,

  // ... (Existing Data)
  initiatives: [
    {
      id: "init-1",
      title: "Julkisivuremontti 2026",
      description:
        "Ehdotetaan julkisivun maalausta ja parvekkeiden kunnostusta.",
      status: "OPEN_FOR_SUPPORT",
      authorId: "user-resident-1",
      votes: [],
      createdAt: new Date(2025, 9, 10),
    },
  ],

  tickets: [
    {
      id: "ticket-1",
      title: "Vuotava hana",
      description: "Keittiön hana tiputtaa vettä.",
      status: "OPEN",
      priority: "MEDIUM",
      type: "MAINTENANCE",
      category: "MAINTENANCE",
      triageLevel: "ROUTINE",
      apartmentId: "A 1",
      createdAt: new Date(2025, 10, 1),
      date: new Date(2025, 10, 1),
      createdById: "user-resident-1",
    },
  ],

  feed: [],

  finance: {
    monthlyIncome: 12500,
    monthlyTarget: 12000,
    reserveFund: 45000,
    realTimeCash: 12450.25,
    unpaidInvoicesCount: 3,
    budgetRemaining: 18400.0,
    energyCostDiff: -150,
    collectionPercentage: 98.5,
    companyLoansTotal: 450000,
    energySavingsPct: 12.5,
  },

  renovations: [
    {
      id: "renov-hist-1",
      component: "Katto",
      yearDone: 2010,
      cost: 45000,
      expectedLifeSpan: 40,
      description: "Huopakaton uusiminen",
      status: "COMPLETED",
    },
    {
      id: "renov-plan-1",
      component: "Julkisivu",
      plannedYear: 2027,
      cost: 120000,
      expectedLifeSpan: 30,
      description: "Maalaus ja saumaus",
      status: "PLANNED",
    },
  ],

  observations: [],

  projects: [],

  mmlSyncLogs: [],

  subscription: {
    id: "sub-1",
    plan: "PRO",
    status: "ACTIVE",
    monthlyPrice: 49.0,
    expiresAt: null,
    nextBillingDate: new Date(2026, 1, 1), // 1st Feb 2026
  },

  featureAccess: [
    {
      id: "feat-1",
      key: "MML_SYNC",
      name: "MML Integraatio",
      description: "Automaattinen tiedonsiirto.",
      price: 29.0,
      isEnabled: true,
    },
    {
      id: "feat-2",
      key: "TENDERING",
      name: "Kilpailutus & Valvonta",
      description: "Täysi projektinhallinta.",
      price: 49.0,
      isEnabled: true,
    },
    {
      id: "feat-3",
      key: "ENERGY_AI",
      name: "Energia-AI & ROI",
      description: "Tekoälypohjainen energiankulutuksen analyysi.",
      price: 15.0,
      isEnabled: false,
    },
  ],

  orders: [],

  invoices: [],

  budgetLines: [
    {
      id: "1",
      category: "HEATING",
      budgetedAmount: 45000,
      actualSpent: 38000,
      year: 2026,
    },
    {
      id: "2",
      category: "WATER",
      budgetedAmount: 12000,
      actualSpent: 5800,
      year: 2026,
    },
    {
      id: "3",
      category: "MAINTENANCE",
      budgetedAmount: 15000,
      actualSpent: 12100,
      year: 2026,
    },
    {
      id: "4",
      category: "CLEANING",
      budgetedAmount: 8000,
      actualSpent: 3800,
      year: 2026,
    },
    {
      id: "5",
      category: "ADMIN",
      budgetedAmount: 18000,
      actualSpent: 9000,
      year: 2026,
    },
  ],

  vendorRules: [
    {
      id: "rule-1",
      yTunnus: "1234567-8",
      vendorName: null,
      category: "HEATING",
      createdAt: new Date(),
    },
  ],

  servicePartners: [
    {
      id: "1",
      name: "Putki-Pekka Oy",
      category: "PLUMBER",
      rating: 4.8,
      verified: true,
      phone: "040-1234567",
    },
    {
      id: "2",
      name: "Sähkö-Simo Tmi",
      category: "ELECTRICIAN",
      rating: 4.5,
      verified: true,
      phone: "050-9876543",
    },
    {
      id: "3",
      name: "Piha & Puutarha",
      category: "LANDSCAPER",
      rating: 4.2,
      verified: false,
      phone: "044-5555555",
    },
    {
      id: "4",
      name: "Lukko-Lasse",
      category: "LOCKSMITH",
      rating: 4.9,
      verified: true,
      phone: "040-9998877",
    },
  ],

  // New Data
  annualTasks: [],
  strategicGoals: [
    {
      id: "goal-1",
      title: "Energiatehokkuus 2030",
      targetValue: 85,
      currentValue: 120,
      unit: "kWh/m²",
      status: "IN_PROGRESS" as GoalStatus,
      targetDate: new Date(2030, 0, 1),
      housingCompanyId: "company-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "goal-2",
      title: "Hoitovastikkeen vakautus",
      targetValue: 4.5,
      currentValue: 4.5,
      unit: "€/m²",
      status: "ACHIEVED" as GoalStatus,
      targetDate: new Date(2027, 0, 1),
      housingCompanyId: "company-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  fiscalConfig: {
    id: "fiscal-1",
    housingCompanyId: "company-1",
    startMonth: 1, // January
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  apartmentCount: 15, // Mock value
  systemStats: {
    mrr: 15600, // Mock total across all companies
    totalTransactionRevenue: 4500,
    activeCompanies: 120,
    certificatesSold: 340,
  },
  valuation: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  addInitiative: (initiative) =>
    set((state) => ({ initiatives: [...state.initiatives, initiative] })),
  updateInitiativeStatus: (id, status) =>
    set((state) => ({
      initiatives: state.initiatives.map((i) =>
        i.id === id ? { ...i, status } : i,
      ),
    })),
  castVote: (initiativeId, userId, choice, shares) =>
    set((state) => ({
      initiatives: state.initiatives.map((i) =>
        i.id === initiativeId
          ? {
              ...i,
              votes: [
                ...i.votes.filter((v) => v.userId !== userId),
                { userId, choice, shares },
              ],
            }
          : i,
      ),
    })),
  addTicket: (ticket) =>
    set((state) => ({ tickets: [...state.tickets, ticket] })),
  updateTicketStatus: (id, status) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
  addObservation: (observation) =>
    set((state) => ({ observations: [observation, ...state.observations] })),
  addAssessment: (observationId, assessment) =>
    set((state) => ({
      observations: state.observations.map((o) =>
        o.id === observationId
          ? {
              ...o,
              status: "REVIEWED",
              assessment: { ...assessment, options: [] },
            }
          : o,
      ),
    })),
  addSolutionOption: (observationId, option) =>
    set((state) => ({
      observations: state.observations.map((o) =>
        o.id === observationId && o.assessment
          ? {
              ...o,
              assessment: {
                ...o.assessment,
                options: [...(o.assessment.options || []), option],
              },
            }
          : o,
      ),
    })),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProjectStatus: (id, status) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
  addTender: (projectId, tender) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, tenders: [...p.tenders, tender] } : p,
      ),
    })),
  addBid: (tenderId, bid) =>
    set((state) => ({
      projects: state.projects.map((p) => ({
        ...p,
        tenders: p.tenders.map((t) =>
          t.id === tenderId ? { ...t, bids: [...t.bids, bid] } : t,
        ),
      })),
    })),
  selectWinnerBid: (projectId, tenderId, bidId) =>
    set((state) => {
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const updatedTenders = p.tenders.map((t) =>
          t.id === tenderId
            ? {
                ...t,
                status: "CLOSED" as TenderStatus,
                bids: t.bids.map((b) => ({ ...b, isWinner: b.id === bidId })),
              }
            : t,
        );
        let newStatus = p.status;
        if (p.status === "DIAGNOSIS") newStatus = "PLANNING";
        else if (p.status === "PLANNING") newStatus = "EXECUTION";
        else if (p.status === "EXECUTION") newStatus = "CONSTRUCTION";
        return { ...p, tenders: updatedTenders, status: newStatus };
      });
      return { projects: updatedProjects };
    }),
  addSiteReport: (report) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === report.projectId
          ? { ...p, siteReports: [report, ...p.siteReports] }
          : p,
      ),
    })),
  updateChangeOrder: (id, status) =>
    set((state) => ({
      projects: state.projects.map((p) => ({
        ...p,
        changeOrders: p.changeOrders.map((co) =>
          co.id === id ? { ...co, status } : co,
        ),
      })),
    })),
  updateMilestoneStatus: (projectId, milestoneId, status) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              milestones: p.milestones.map((m) =>
                m.id === milestoneId ? { ...m, status } : m,
              ),
            }
          : p,
      ),
    })),
  completeProjectInStore: (projectId, warrantyEndDate) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, status: "COMPLETED" as ProjectStatus, warrantyEndDate }
          : p,
      ),
    })),
  addMMLSyncLog: (log) =>
    set((state) => ({ mmlSyncLogs: [log, ...state.mmlSyncLogs] })),
  setSubscriptionPlan: (plan) =>
    set((state) => ({ subscription: { ...state.subscription, plan } })),
  toggleFeature: (key, isEnabled) =>
    set((state) => ({
      featureAccess: state.featureAccess.map((f) =>
        f.key === key ? { ...f, isEnabled } : f,
      ),
    })),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  syncInvoices: (newInvoices) =>
    set((state) => ({
      invoices: [
        ...state.invoices,
        ...newInvoices.filter(
          (ni) => !state.invoices.find((i) => i.externalId === ni.externalId),
        ),
      ],
    })),
  updateInvoiceStatus: (id, status, approvedById) =>
    set((state) => {
      let updatedBudgetLines = state.budgetLines;
      const invoice = state.invoices.find((i) => i.id === id);
      if (status === "APPROVED" && invoice) {
        updatedBudgetLines = state.budgetLines.map((line) =>
          line.category === invoice.category
            ? { ...line, actualSpent: line.actualSpent + invoice.amount }
            : line,
        );
      }
      return {
        invoices: state.invoices.map((i) =>
          i.id === id
            ? { ...i, status, approvedById: approvedById || i.approvedById }
            : i,
        ),
        budgetLines: updatedBudgetLines,
        feed:
          status === "APPROVED" && invoice
            ? [
                {
                  id: `feed-inv-${Date.now()}`,
                  type: "INVOICE_APPROVED",
                  title: "Lasku hyväksytty",
                  date: new Date(),
                  content: `${invoice.vendorName}: ${invoice.amount} € (${invoice.category})`,
                },
                ...state.feed,
              ]
            : state.feed,
      };
    }),
  addVendorRule: (rule) =>
    set((state) => {
      const filtered = state.vendorRules.filter(
        (r) => !(rule.yTunnus && r.yTunnus === rule.yTunnus),
      );
      return { vendorRules: [...filtered, rule] };
    }),
  updateInvoiceCategory: (id, category) =>
    set((state) => ({
      invoices: state.invoices.map((i) =>
        i.id === id ? { ...i, category } : i,
      ),
    })),
  hydrate: (data: Partial<AppState>) => set((state) => ({ ...state, ...data })),
}));
