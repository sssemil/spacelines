import { useMemo } from 'react'
import { useSatelliteStore } from '../../store/satellite-store'
import { useFilterStore } from '../../store/filter-store'
import { formatCount } from '../../utils/formatters'

export const StatsBar = () => {
  const satellites = useSatelliteStore((s) => s.satellites)
  const loading = useSatelliteStore((s) => s.loading)
  const activeCategories = useFilterStore((s) => s.activeCategories)

  const visibleCount = useMemo(
    () => satellites.filter((s) => activeCategories.has(s.category)).length,
    [satellites, activeCategories],
  )

  return (
    <div className="panel stats-bar">
      {loading ? (
        <span className="stats-loading">Loading satellite data...</span>
      ) : (
        <>
          <span className="stat">
            <span className="stat-value">{formatCount(satellites.length)}</span>
            <span className="stat-label">Tracked</span>
          </span>
          <span className="stat">
            <span className="stat-value">{formatCount(visibleCount)}</span>
            <span className="stat-label">Visible</span>
          </span>
          <span className="stat">
            <span className="stat-value">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="stat-label">UTC</span>
          </span>
        </>
      )}
    </div>
  )
}
