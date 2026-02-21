import { create } from 'zustand'
import type { SatelliteCategory } from '../types/satellite'

const ALL_CATEGORIES: readonly SatelliteCategory[] = [
  'station', 'starlink', 'oneweb', 'gps', 'glonass',
  'galileo', 'beidou', 'weather', 'earth-observation',
  'communications', 'debris', 'rocket-body', 'unknown',
]

const DEFAULT_CATEGORIES: readonly SatelliteCategory[] = ALL_CATEGORIES.filter(
  (c) => c !== 'unknown',
)

type FilterState = {
  readonly searchQuery: string
  readonly activeCategories: Set<SatelliteCategory>
  readonly showGroundStations: boolean
  readonly setSearchQuery: (query: string) => void
  readonly toggleCategory: (category: SatelliteCategory) => void
  readonly setOnlyCategory: (category: SatelliteCategory) => void
  readonly enableAllCategories: () => void
  readonly disableAllCategories: () => void
  readonly toggleGroundStations: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  activeCategories: new Set(DEFAULT_CATEGORIES),
  showGroundStations: true,
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleCategory: (category) =>
    set((state) => {
      const next = new Set(state.activeCategories)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return { activeCategories: next }
    }),
  setOnlyCategory: (category) =>
    set({ activeCategories: new Set([category]) }),
  enableAllCategories: () =>
    set({ activeCategories: new Set(ALL_CATEGORIES) }),
  disableAllCategories: () =>
    set({ activeCategories: new Set() }),
  toggleGroundStations: () =>
    set((state) => ({ showGroundStations: !state.showGroundStations })),
}))
