import { useMemo, useState, useEffect } from 'react'
import type { Satellite } from '../types/satellite'

const DEFAULT_MAX_RESULTS = 20

export const searchSatellites = (
  satellites: readonly Satellite[],
  query: string,
  maxResults: number = DEFAULT_MAX_RESULTS,
): readonly Satellite[] => {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase()
  const results: Satellite[] = []

  for (const sat of satellites) {
    if (results.length >= maxResults) break

    const matchesName = sat.name.toLowerCase().includes(lowerQuery)
    const matchesId = String(sat.id).includes(query)
    const matchesDesignator = sat.intlDesignator.toLowerCase().includes(lowerQuery)

    if (matchesName || matchesId || matchesDesignator) {
      results.push(sat)
    }
  }

  return results
}

export const useSatelliteSearch = (
  satellites: readonly Satellite[],
  query: string,
  debounceMs: number = 200,
): readonly Satellite[] => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs)
    return () => clearTimeout(timer)
  }, [query, debounceMs])

  return useMemo(
    () => searchSatellites(satellites, debouncedQuery),
    [satellites, debouncedQuery],
  )
}
