import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DetailPanel } from './detail-panel'
import { useSatelliteStore } from '../../store/satellite-store'
import { twoline2satrec } from 'satellite.js'

const ISS_TLE_LINE1 = '1 25544U 98067A   24015.50000000  .00002182  00000-0  36771-3 0  9993'
const ISS_TLE_LINE2 = '2 25544  51.6461 247.4627 0006703 130.5360 259.8238 15.49560532438597'

describe('DetailPanel', () => {
  beforeEach(() => {
    useSatelliteStore.setState({
      satellites: [
        {
          id: 25544,
          name: 'ISS (ZARYA)',
          intlDesignator: '1998-067A',
          category: 'station',
          satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
          epochDate: new Date('2024-01-15T12:00:00.000Z'),
        },
      ],
      selectedId: null,
      loading: false,
      error: null,
    })
  })

  it('should show nothing when no satellite is selected', () => {
    const { container } = render(<DetailPanel />)

    expect(container.firstChild).toBeNull()
  })

  it('should show satellite name when selected', () => {
    useSatelliteStore.setState({ selectedId: 25544 })

    render(<DetailPanel />)

    expect(screen.getByText('ISS (ZARYA)')).toBeInTheDocument()
  })

  it('should show NORAD ID when selected', () => {
    useSatelliteStore.setState({ selectedId: 25544 })

    render(<DetailPanel />)

    expect(screen.getByText('25544')).toBeInTheDocument()
  })

  it('should show satellite category', () => {
    useSatelliteStore.setState({ selectedId: 25544 })

    render(<DetailPanel />)

    expect(screen.getByText(/station/i)).toBeInTheDocument()
  })
})
