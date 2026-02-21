import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsBar } from './stats-bar'
import { useSatelliteStore } from '../../store/satellite-store'
import { useFilterStore } from '../../store/filter-store'
import { twoline2satrec } from 'satellite.js'

const ISS_TLE_LINE1 = '1 25544U 98067A   24015.50000000  .00002182  00000-0  36771-3 0  9993'
const ISS_TLE_LINE2 = '2 25544  51.6461 247.4627 0006703 130.5360 259.8238 15.49560532438597'

const getTestSat = (id: number, name: string, category: string) => ({
  id,
  name,
  intlDesignator: '1998-067A',
  category: category as 'station',
  satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
  epochDate: new Date('2024-01-15T12:00:00.000Z'),
})

describe('StatsBar', () => {
  beforeEach(() => {
    useFilterStore.setState({
      activeCategories: new Set([
        'station', 'starlink', 'oneweb', 'gps', 'glonass',
        'galileo', 'beidou', 'weather', 'earth-observation',
        'communications', 'debris', 'rocket-body', 'unknown',
      ]),
    })
  })

  it('should show total tracked count', () => {
    useSatelliteStore.setState({
      satellites: [
        getTestSat(1, 'SAT-1', 'station'),
        getTestSat(2, 'SAT-2', 'starlink'),
      ],
      selectedId: null,
      loading: false,
      error: null,
    })

    render(<StatsBar />)

    expect(screen.getAllByText('2')).toHaveLength(2)
    expect(screen.getByText(/tracked/i)).toBeInTheDocument()
  })

  it('should show loading state', () => {
    useSatelliteStore.setState({
      satellites: [],
      selectedId: null,
      loading: true,
      error: null,
    })

    render(<StatsBar />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
