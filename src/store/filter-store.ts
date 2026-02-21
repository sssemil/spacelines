import { create } from 'zustand'
import type { SatelliteCategory } from '../types/satellite'

const ALL_CATEGORIES: readonly SatelliteCategory[] = [
  'station', 'starlink', 'oneweb', 'gps', 'glonass',
  'galileo', 'beidou', 'weather', 'earth-observation',
  'communications', 'debris', 'rocket-body', 'unknown',
]

type FilterState = {
  readonly searchQuery: string
  readonly activeCategories: Set<SatelliteCategory>
  readonly setSearchQuery: (query: string) => void
  readonly toggleCategory: (category: SatelliteCategory) => void
  readonly setOnlyCategory: (category: SatelliteCategory) => void
  readonly enableAllCategories: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  activeCategories: new Set(ALL_CATEGORIES),
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
}))
