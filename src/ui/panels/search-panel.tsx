import { useState, useCallback } from 'react'
import { useSatelliteStore } from '../../store/satellite-store'
import { searchSatellites } from '../../hooks/use-satellite-search'

export const SearchPanel = () => {
  const [query, setQuery] = useState('')
  const satellites = useSatelliteStore((s) => s.satellites)
  const selectSatellite = useSatelliteStore((s) => s.selectSatellite)

  const results = searchSatellites(satellites, query, 10)

  const handleSelect = useCallback(
    (id: number) => {
      selectSatellite(id)
      setQuery('')
    },
    [selectSatellite],
  )

  return (
    <div className="panel search-panel">
      <input
        type="text"
        placeholder="Search satellites..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map((sat) => (
            <button
              key={sat.id}
              className="search-result-item"
              onClick={() => handleSelect(sat.id)}
            >
              <span className="result-name">{sat.name}</span>
              <span className="result-id">{sat.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
