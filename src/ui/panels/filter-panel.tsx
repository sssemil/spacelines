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
  const enableAll = useFilterStore((s) => s.enableAllCategories)
  const disableAll = useFilterStore((s) => s.disableAllCategories)
  const showGroundStations = useFilterStore((s) => s.showGroundStations)
  const toggleGroundStations = useFilterStore((s) => s.toggleGroundStations)
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
        <button className="filter-chip active" onClick={enableAll}>
          <span className="chip-label">All</span>
        </button>
        <button className="filter-chip active" onClick={disableAll}>
          <span className="chip-label">None</span>
        </button>
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
        <button
          className={`filter-chip stations ${showGroundStations ? 'active' : 'inactive'}`}
          onClick={toggleGroundStations}
        >
          <span className="chip-label">Ground Stations</span>
        </button>
      </div>
    </div>
  )
}
