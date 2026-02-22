import { describe, it, expect, beforeEach } from 'vitest'
import { useGroundStationStore } from './ground-station-store'
import { useSatelliteStore } from './satellite-store'
import type { GroundStation } from '../schemas/ground-station'

const getMockStation = (overrides?: Partial<GroundStation>): GroundStation => ({
  id: 1,
  name: 'Test Station',
  lat: 51.5,
  lng: -0.1,
  altitude: 25,
  status: 'Online',
  ...overrides,
})

describe('ground station store', () => {
  beforeEach(() => {
    useGroundStationStore.setState({
      stations: [],
      selectedId: null,
    })
    useSatelliteStore.setState({
      selectedId: null,
    })
  })

  it('should start with no stations and no selection', () => {
    const state = useGroundStationStore.getState()

    expect(state.stations).toEqual([])
    expect(state.selectedId).toBeNull()
  })

  it('should store stations via setStations', () => {
    const stations = [getMockStation(), getMockStation({ id: 2, name: 'Station 2' })]

    useGroundStationStore.getState().setStations(stations)

    expect(useGroundStationStore.getState().stations).toEqual(stations)
  })

  it('should select a station by id', () => {
    useGroundStationStore.getState().setStations([getMockStation()])

    useGroundStationStore.getState().selectStation(1)

    expect(useGroundStationStore.getState().selectedId).toBe(1)
  })

  it('should clear selection', () => {
    useGroundStationStore.getState().selectStation(1)

    useGroundStationStore.getState().clearSelection()

    expect(useGroundStationStore.getState().selectedId).toBeNull()
  })

  it('should return selected station from getSelectedStation', () => {
    const station = getMockStation({ id: 42, name: 'Alpha' })
    useGroundStationStore.getState().setStations([station])
    useGroundStationStore.getState().selectStation(42)

    const selected = useGroundStationStore.getState().getSelectedStation()

    expect(selected).toEqual(station)
  })

  it('should return undefined from getSelectedStation when nothing selected', () => {
    const selected = useGroundStationStore.getState().getSelectedStation()

    expect(selected).toBeUndefined()
  })

  it('should clear satellite selection when selecting a station', () => {
    useSatelliteStore.setState({ selectedId: 12345 })

    useGroundStationStore.getState().selectStation(1)

    expect(useSatelliteStore.getState().selectedId).toBeNull()
  })
})
