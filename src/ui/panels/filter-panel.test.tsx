import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterPanel } from './filter-panel'
import { useFilterStore } from '../../store/filter-store'
import { useSatelliteStore } from '../../store/satellite-store'
import { twoline2satrec } from 'satellite.js'

const ISS_TLE_LINE1 = '1 25544U 98067A   24015.50000000  .00002182  00000-0  36771-3 0  9993'
const ISS_TLE_LINE2 = '2 25544  51.6461 247.4627 0006703 130.5360 259.8238 15.49560532438597'

describe('FilterPanel', () => {
  beforeEach(() => {
    useFilterStore.setState({
      searchQuery: '',
      activeCategories: new Set([
        'station', 'starlink', 'oneweb', 'gps', 'glonass',
        'galileo', 'beidou', 'weather', 'earth-observation',
        'communications', 'debris', 'rocket-body', 'unknown',
      ]),
      showGroundStations: true,
    })
    useSatelliteStore.setState({
      satellites: [
        {
          id: 25544,
          name: 'ISS (ZARYA)',
          intlDesignator: '1998-067A',
          category: 'station' as const,
          satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
          epochDate: new Date('2024-01-15T12:00:00.000Z'),
        },
        {
          id: 48274,
          name: 'STARLINK-1234',
          intlDesignator: '2021-024A',
          category: 'starlink' as const,
          satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
          epochDate: new Date('2024-01-15T12:00:00.000Z'),
        },
        {
          id: 99999,
          name: 'COSMOS 1408 DEB',
          intlDesignator: '1982-092A',
          category: 'debris' as const,
          satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
          epochDate: new Date('2024-01-15T12:00:00.000Z'),
        },
      ],
      selectedId: null,
      loading: false,
      error: null,
    })
  })

  it('should render category filter buttons', () => {
    render(<FilterPanel />)

    expect(screen.getByText('Station')).toBeInTheDocument()
    expect(screen.getByText('Starlink')).toBeInTheDocument()
    expect(screen.getByText('Debris')).toBeInTheDocument()
  })

  it('should toggle a category when clicked', async () => {
    const user = userEvent.setup()
    render(<FilterPanel />)

    const debrisBtn = screen.getByText(/debris/i)
    await user.click(debrisBtn)

    expect(useFilterStore.getState().activeCategories.has('debris')).toBe(false)
  })

  it('should show category counts', () => {
    render(<FilterPanel />)

    const countElements = screen.getAllByText('1')
    expect(countElements).toHaveLength(3)
  })

  it('should render a Ground Stations chip', () => {
    render(<FilterPanel />)

    expect(screen.getByText('Ground Stations')).toBeInTheDocument()
  })

  it('should toggle ground stations when Ground Stations chip is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterPanel />)

    const stationsBtn = screen.getByText('Ground Stations')
    await user.click(stationsBtn)

    expect(useFilterStore.getState().showGroundStations).toBe(false)
  })

  it('should style Ground Stations chip as inactive when ground stations are hidden', () => {
    useFilterStore.setState({ showGroundStations: false })
    render(<FilterPanel />)

    const chip = screen.getByText('Ground Stations').closest('button')
    expect(chip?.className).toContain('inactive')
  })
})
