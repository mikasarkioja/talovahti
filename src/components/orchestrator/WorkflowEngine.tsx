import {
  Project,
  InvestmentGrade,
  LeakAlert,
} from "@prisma/client";

export type WorkflowPhase = "SCAN" | "OPTIMIZE" | "FUND" | "EXECUTE" | "SETTLE";

export interface WorkflowState {
  currentPhase: WorkflowPhase;
  healthScore: number; // 0-100
  nextActions: WorkflowAction[];
  metrics: {
    investmentGrade: string;
    complianceStatus: "OK" | "WARN" | "CRITICAL";
    activeAlerts: number;
  };
}

export interface WorkflowAction {
  id: string;
  title: string;
  description: string;
  type: "URGENT" | "ROUTINE" | "OPPORTUNITY";
  phase: WorkflowPhase;
  actionUrl: string;
  isReady: boolean;
}

export const WorkflowEngine = {
  analyze(
    project: Project & {
      contract?: { signedAt?: Date | string | null };
    },
    ig: InvestmentGrade | null,
    alerts: LeakAlert[],
  ): WorkflowState {
    let phase: WorkflowPhase = "SCAN";
    const actions: WorkflowAction[] = [];

        // 1. Determine Phase
        if (project.status === 'COMPLETED') phase = 'SETTLE'
        else if (['CONSTRUCTION', 'TECH_LEAD', 'WARRANTY'].includes(project.status)) phase = 'EXECUTE'
        else if (['TENDERING'].includes(project.status)) phase = 'FUND'
        else if (['ROI_ANALYSIS', 'DIAGNOSIS'].includes(project.status)) phase = 'OPTIMIZE'
        
        // 2. Generate Actions based on Phase & Data
        
        // SCAN PHASE
        if (alerts.some(a => a.status === 'ACTIVE' && a.severity === 'HIGH')) {
            actions.push({
                id: 'scan-leak',
                title: 'Kriittinen Vuotohälytys',
                description: 'Korkean riskin putkivuoto havaittu. Tarkista heti.',
                type: 'URGENT',
                phase: 'SCAN',
                actionUrl: '/admin/maintenance',
                isReady: true
            })
        }

        // OPTIMIZE PHASE
        if (phase === 'OPTIMIZE' && (!project.energySavingsEst || project.energySavingsEst === 0)) {
            actions.push({
                id: 'opt-energy',
                title: 'Laske Energiasäästöt',
                description: 'Päivitä hankkeen ROI-laskelma energiasimulaatiolla.',
                type: 'OPPORTUNITY',
                phase: 'OPTIMIZE',
                actionUrl: `/admin/scenarios`,
                isReady: true
            })
        }

        // FUND PHASE
        if (phase === "FUND") {
          // Fund phase actions removed as part of Bank Bridge pruning
        }

        // EXECUTE PHASE
        if (phase === 'EXECUTE') {
             if (!project.contract?.signedAt) {
                actions.push({
                    id: 'exec-sign',
                    title: 'Allekirjoita Urakkasopimus',
                    description: 'Urakoitsija valittu, mutta sopimus puuttuu.',
                    type: 'URGENT',
                    phase: 'EXECUTE',
                    actionUrl: `/admin/projects/${project.id}/contract`,
                    isReady: true
                })
             }
        }

        // SETTLE PHASE
        if (phase === 'SETTLE') {
            // Check MML Sync (mock logic)
            actions.push({
                id: 'settle-mml',
                title: 'MML Ilmoitus',
                description: 'Päivitä yhtiöjärjestys Maanmittauslaitokselle.',
                type: 'ROUTINE',
                phase: 'SETTLE',
                actionUrl: '/admin/mml-sync',
                isReady: true
            })
        }

        // 3. Health Score
        let score = 100
        if (alerts.length > 0) score -= 20
        if (ig && ig.score < 60) score -= 30
        
        return {
            currentPhase: phase,
            healthScore: Math.max(0, score),
            nextActions: actions,
            metrics: {
                investmentGrade: ig ? ig.grade : 'N/A',
                complianceStatus: score > 80 ? 'OK' : (score > 50 ? 'WARN' : 'CRITICAL'),
                activeAlerts: alerts.length
            }
        }
    }
}
