import { create } from 'zustand'
import type { Satellite } from '../types/satellite'

type SatelliteState = {
  readonly satellites: readonly Satellite[]
  readonly selectedId: number | null
  readonly loading: boolean
  readonly error: string | null
  readonly setSatellites: (satellites: readonly Satellite[]) => void
  readonly selectSatellite: (id: number) => void
  readonly clearSelection: () => void
  readonly setLoading: (loading: boolean) => void
  readonly setError: (error: string | null) => void
  readonly getSelectedSatellite: () => Satellite | undefined
}

export const useSatelliteStore = create<SatelliteState>((set, get) => ({
  satellites: [],
  selectedId: null,
  loading: false,
  error: null,
  setSatellites: (satellites) => set({ satellites }),
  selectSatellite: (id) => set({ selectedId: id }),
  clearSelection: () => set({ selectedId: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  getSelectedSatellite: () => {
    const { satellites, selectedId } = get()
    if (selectedId === null) return undefined
    return satellites.find((s) => s.id === selectedId)
  },
}))
