import { create } from 'zustand'

export type RenovationPin = {
  id: string
  x: number
  y: number
  z: number
  label?: string
  roomType?: 'WET_ROOM' | 'KITCHEN' | 'WALL' | 'OTHER'
}

interface RenovationState {
  pins: RenovationPin[]
  isPlacementMode: boolean
  activePinId: string | null
  
  // Actions
  addPin: (pin: RenovationPin) => void
  removePin: (id: string) => void
  setPlacementMode: (active: boolean) => void
  setActivePin: (id: string | null) => void
}

export const useRenovationStore = create<RenovationState>((set) => ({
  pins: [],
  isPlacementMode: false,
  activePinId: null,

  addPin: (pin) => set((state) => ({ pins: [...state.pins, pin] })),
  removePin: (id) => set((state) => ({ pins: state.pins.filter(p => p.id !== id) })),
  setPlacementMode: (active) => set({ isPlacementMode: active }),
  setActivePin: (id) => set({ activePinId: id }),
}))
