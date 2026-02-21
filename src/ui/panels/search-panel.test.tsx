import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchPanel } from './search-panel'
import { useSatelliteStore } from '../../store/satellite-store'
import { useFilterStore } from '../../store/filter-store'
import { twoline2satrec } from 'satellite.js'

const ISS_TLE_LINE1 = '1 25544U 98067A   24015.50000000  .00002182  00000-0  36771-3 0  9993'
const ISS_TLE_LINE2 = '2 25544  51.6461 247.4627 0006703 130.5360 259.8238 15.49560532438597'

const getTestSatellites = () => [
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
]

describe('SearchPanel', () => {
  beforeEach(() => {
    useSatelliteStore.setState({
      satellites: getTestSatellites(),
      selectedId: null,
      loading: false,
      error: null,
    })
    useFilterStore.setState({ searchQuery: '' })
  })

  it('should render search input', () => {
    render(<SearchPanel />)

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('should show results when typing a query', async () => {
    const user = userEvent.setup()
    render(<SearchPanel />)

    await user.type(screen.getByPlaceholderText(/search/i), 'ISS')

    expect(await screen.findByText('ISS (ZARYA)')).toBeInTheDocument()
  })

  it('should select a satellite when clicking a result', async () => {
    const user = userEvent.setup()
    render(<SearchPanel />)

    await user.type(screen.getByPlaceholderText(/search/i), 'ISS')
    await user.click(await screen.findByText('ISS (ZARYA)'))

    expect(useSatelliteStore.getState().selectedId).toBe(25544)
  })
})
