import { describe, it, expect } from 'vitest'
import { searchSatellites } from './use-satellite-search'
import { twoline2satrec } from 'satellite.js'
import type { Satellite } from '../types/satellite'

const ISS_TLE_LINE1 = '1 25544U 98067A   24015.50000000  .00002182  00000-0  36771-3 0  9993'
const ISS_TLE_LINE2 = '2 25544  51.6461 247.4627 0006703 130.5360 259.8238 15.49560532438597'

const getTestSatellites = (): readonly Satellite[] => [
  {
    id: 25544,
    name: 'ISS (ZARYA)',
    intlDesignator: '1998-067A',
    category: 'station',
    satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
    epochDate: new Date('2024-01-15T12:00:00.000Z'),
  },
  {
    id: 48274,
    name: 'STARLINK-1234',
    intlDesignator: '2021-024A',
    category: 'starlink',
    satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
    epochDate: new Date('2024-01-15T12:00:00.000Z'),
  },
  {
    id: 25545,
    name: 'ISS DEB',
    intlDesignator: '1998-067B',
    category: 'debris',
    satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
    epochDate: new Date('2024-01-15T12:00:00.000Z'),
  },
]

describe('searchSatellites', () => {
  it('should return empty array for empty query', () => {
    const results = searchSatellites(getTestSatellites(), '')

    expect(results).toEqual([])
  })

  it('should find satellites by name (case-insensitive)', () => {
    const results = searchSatellites(getTestSatellites(), 'iss')

    expect(results).toHaveLength(2)
    expect(results[0].name).toBe('ISS (ZARYA)')
    expect(results[1].name).toBe('ISS DEB')
  })

  it('should find satellites by NORAD ID', () => {
    const results = searchSatellites(getTestSatellites(), '25544')

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(25544)
  })

  it('should find satellites by international designator', () => {
    const results = searchSatellites(getTestSatellites(), '1998-067')

    expect(results).toHaveLength(2)
  })

  it('should limit results to maxResults', () => {
    const results = searchSatellites(getTestSatellites(), 'iss', 1)

    expect(results).toHaveLength(1)
  })

  it('should return empty for no matches', () => {
    const results = searchSatellites(getTestSatellites(), 'NONEXISTENT')

    expect(results).toEqual([])
  })
})
