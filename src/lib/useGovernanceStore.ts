import { create } from "zustand";

interface GovernanceStore {
  participatedApartmentIds: string[];
  setParticipatedApartmentIds: (ids: string[]) => void;
}

export const useGovernanceStore = create<GovernanceStore>((set) => ({
  participatedApartmentIds: [],
  setParticipatedApartmentIds: (ids) => set({ participatedApartmentIds: ids }),
}));
