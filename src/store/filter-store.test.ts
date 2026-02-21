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
})
