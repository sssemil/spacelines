import { describe, it, expect, beforeEach } from 'vitest'
import { useFilterStore } from './filter-store'

describe('filter store', () => {
  beforeEach(() => {
    useFilterStore.setState({
      searchQuery: '',
      activeCategories: new Set([
        'station', 'starlink', 'oneweb', 'gps', 'glonass',
        'galileo', 'beidou', 'weather', 'earth-observation',
        'communications', 'debris', 'rocket-body',
      ]),
      showGroundStations: true,
      showMoon: true,
    })
  })

  it('should start with empty search query', () => {
    expect(useFilterStore.getState().searchQuery).toBe('')
  })

  it('should start with all categories active except unknown', () => {
    const categories = useFilterStore.getState().activeCategories
    expect(categories.has('station')).toBe(true)
    expect(categories.has('starlink')).toBe(true)
    expect(categories.has('debris')).toBe(true)
    expect(categories.has('unknown')).toBe(false)
    expect(categories.size).toBe(12)
  })

  it('should update search query', () => {
    useFilterStore.getState().setSearchQuery('ISS')

    expect(useFilterStore.getState().searchQuery).toBe('ISS')
  })

  it('should toggle a category off', () => {
    useFilterStore.getState().toggleCategory('debris')

    expect(useFilterStore.getState().activeCategories.has('debris')).toBe(false)
  })

  it('should toggle a category back on', () => {
    useFilterStore.getState().toggleCategory('debris')
    useFilterStore.getState().toggleCategory('debris')

    expect(useFilterStore.getState().activeCategories.has('debris')).toBe(true)
  })

  it('should enable only one category', () => {
    useFilterStore.getState().setOnlyCategory('station')

    const categories = useFilterStore.getState().activeCategories
    expect(categories.size).toBe(1)
    expect(categories.has('station')).toBe(true)
  })

  it('should enable all categories including unknown', () => {
    useFilterStore.getState().setOnlyCategory('station')
    useFilterStore.getState().enableAllCategories()

    expect(useFilterStore.getState().activeCategories.size).toBe(13)
    expect(useFilterStore.getState().activeCategories.has('unknown')).toBe(true)
  })

  it('should start with ground stations visible', () => {
    expect(useFilterStore.getState().showGroundStations).toBe(true)
  })

  it('should toggle ground stations off', () => {
    useFilterStore.getState().toggleGroundStations()

    expect(useFilterStore.getState().showGroundStations).toBe(false)
  })

  it('should toggle ground stations back on', () => {
    useFilterStore.getState().toggleGroundStations()
    useFilterStore.getState().toggleGroundStations()

    expect(useFilterStore.getState().showGroundStations).toBe(true)
  })

  it('should start with Moon visible', () => {
    expect(useFilterStore.getState().showMoon).toBe(true)
  })

  it('should toggle Moon off', () => {
    useFilterStore.getState().toggleMoon()

    expect(useFilterStore.getState().showMoon).toBe(false)
  })

  it('should toggle Moon back on', () => {
    useFilterStore.getState().toggleMoon()
    useFilterStore.getState().toggleMoon()

    expect(useFilterStore.getState().showMoon).toBe(true)
  })

})
