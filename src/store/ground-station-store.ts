import { create } from 'zustand'
import type { GroundStation } from '../schemas/ground-station'
import { useSatelliteStore } from './satellite-store'

type GroundStationState = {
  readonly stations: readonly GroundStation[]
  readonly selectedId: number | null
  readonly setStations: (stations: readonly GroundStation[]) => void
  readonly selectStation: (id: number) => void
  readonly clearSelection: () => void
  readonly getSelectedStation: () => GroundStation | undefined
}

export const useGroundStationStore = create<GroundStationState>((set, get) => ({
  stations: [],
  selectedId: null,
  setStations: (stations) => set({ stations }),
  selectStation: (id) => {
    useSatelliteStore.getState().clearSelection()
    set({ selectedId: id })
  },
  clearSelection: () => set({ selectedId: null }),
  getSelectedStation: () => {
    const { stations, selectedId } = get()
    if (selectedId === null) return undefined
    return stations.find((s) => s.id === selectedId)
  },
}))
