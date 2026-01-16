import { create } from "zustand";
import { AnnualTask, FiscalConfiguration, FiscalQuarter } from "@prisma/client";

interface TemporalState {
  currentActiveQuarter: FiscalQuarter | null;
  hoveredTask: AnnualTask | null;
  fiscalConfig: FiscalConfiguration | null;

  // Actions
  setActiveQuarter: (quarter: FiscalQuarter | null) => void;
  setHoveredTask: (task: AnnualTask | null) => void;
  setFiscalConfig: (config: FiscalConfiguration) => void;
}

export const useTemporalStore = create<TemporalState>((set) => ({
  currentActiveQuarter: null,
  hoveredTask: null,
  fiscalConfig: null,

  setActiveQuarter: (quarter) => set({ currentActiveQuarter: quarter }),
  setHoveredTask: (task) => set({ hoveredTask: task }),
  setFiscalConfig: (config) => set({ fiscalConfig: config }),
}));
