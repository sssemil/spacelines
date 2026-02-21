import { describe, it, expect, beforeEach } from 'vitest'
import { twoline2satrec } from 'satellite.js'
import { useSatelliteStore } from './satellite-store'

const ISS_TLE_LINE1 = '1 25544U 98067A   24015.50000000  .00002182  00000-0  36771-3 0  9993'
const ISS_TLE_LINE2 = '2 25544  51.6461 247.4627 0006703 130.5360 259.8238 15.49560532438597'

const getTestSatellite = (overrides?: Record<string, unknown>) => ({
  id: 25544,
  name: 'ISS (ZARYA)',
  intlDesignator: '1998-067A',
  category: 'station' as const,
  satrec: twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2),
  epochDate: new Date('2024-01-15T12:00:00.000Z'),
  ...overrides,
})

describe('satellite store', () => {
  beforeEach(() => {
    useSatelliteStore.setState({
      satellites: [],
      selectedId: null,
      loading: false,
      error: null,
    })
  })

  it('should start with empty satellites and no selection', () => {
    const state = useSatelliteStore.getState()

    expect(state.satellites).toEqual([])
    expect(state.selectedId).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should set satellites', () => {
    const sats = [getTestSatellite(), getTestSatellite({ id: 25545, name: 'ISS DEB' })]

    useSatelliteStore.getState().setSatellites(sats)

    expect(useSatelliteStore.getState().satellites).toHaveLength(2)
  })

  it('should select a satellite by ID', () => {
    useSatelliteStore.getState().setSatellites([getTestSatellite()])

    useSatelliteStore.getState().selectSatellite(25544)

    expect(useSatelliteStore.getState().selectedId).toBe(25544)
  })

  it('should clear selection', () => {
    useSatelliteStore.getState().selectSatellite(25544)

    useSatelliteStore.getState().clearSelection()

    expect(useSatelliteStore.getState().selectedId).toBeNull()
  })

  it('should set loading state', () => {
    useSatelliteStore.getState().setLoading(true)

    expect(useSatelliteStore.getState().loading).toBe(true)
  })

  it('should set error state', () => {
    useSatelliteStore.getState().setError('Failed to load')

    expect(useSatelliteStore.getState().error).toBe('Failed to load')
  })

  it('should get selected satellite', () => {
    const sat = getTestSatellite()
    useSatelliteStore.getState().setSatellites([sat])
    useSatelliteStore.getState().selectSatellite(25544)

    const selected = useSatelliteStore.getState().getSelectedSatellite()

    expect(selected?.id).toBe(25544)
  })

  it('should return undefined when no satellite is selected', () => {
    const selected = useSatelliteStore.getState().getSelectedSatellite()

    expect(selected).toBeUndefined()
  })
})
