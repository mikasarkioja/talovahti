import { create } from 'zustand'
import { AnnualTask, FiscalConfiguration, AnnualQuarter } from '@prisma/client'

interface TemporalState {
  currentActiveQuarter: AnnualQuarter | null
  hoveredTask: AnnualTask | null
  fiscalConfig: FiscalConfiguration | null
  
  // Actions
  setActiveQuarter: (quarter: AnnualQuarter | null) => void
  setHoveredTask: (task: AnnualTask | null) => void
  setFiscalConfig: (config: FiscalConfiguration) => void
}

export const useTemporalStore = create<TemporalState>((set) => ({
  currentActiveQuarter: null,
  hoveredTask: null,
  fiscalConfig: null,

  setActiveQuarter: (quarter) => set({ currentActiveQuarter: quarter }),
  setHoveredTask: (task) => set({ hoveredTask: task }),
  setFiscalConfig: (config) => set({ fiscalConfig: config }),
}))
