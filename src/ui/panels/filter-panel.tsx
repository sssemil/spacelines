import { useMemo } from 'react'
import { useFilterStore } from '../../store/filter-store'
import { useSatelliteStore } from '../../store/satellite-store'
import type { SatelliteCategory } from '../../types/satellite'

const CATEGORY_LABELS: Record<SatelliteCategory, string> = {
  station: 'Station',
  starlink: 'Starlink',
  oneweb: 'OneWeb',
  gps: 'GPS',
  glonass: 'GLONASS',
  galileo: 'Galileo',
  beidou: 'Beidou',
  weather: 'Weather',
  'earth-observation': 'Earth Obs',
  communications: 'Comms',
  debris: 'Debris',
  'rocket-body': 'Rocket Body',
  unknown: 'Unknown',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as SatelliteCategory[]

export const FilterPanel = () => {
  const activeCategories = useFilterStore((s) => s.activeCategories)
  const toggleCategory = useFilterStore((s) => s.toggleCategory)
  const satellites = useSatelliteStore((s) => s.satellites)

  const categoryCounts = useMemo(() => {
    const counts = new Map<SatelliteCategory, number>()
    for (const sat of satellites) {
      counts.set(sat.category, (counts.get(sat.category) ?? 0) + 1)
    }
    return counts
  }, [satellites])

  return (
    <div className="panel filter-panel">
      <div className="filter-chips">
        {CATEGORIES.map((category) => {
          const count = categoryCounts.get(category) ?? 0
          if (count === 0) return null
          const isActive = activeCategories.has(category)

          return (
            <button
              key={category}
              className={`filter-chip ${isActive ? 'active' : 'inactive'}`}
              onClick={() => toggleCategory(category)}
            >
              <span className="chip-label">{CATEGORY_LABELS[category]}</span>
              <span className="chip-count">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
