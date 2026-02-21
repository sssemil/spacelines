import { describe, it, expect } from 'vitest'
import { GroundStationSchema, GroundStationResponseSchema } from './ground-station'

const getValidStation = (overrides?: Record<string, unknown>) => ({
  id: 34,
  name: 'M0SZT',
  lat: 53.0027,
  lng: -2.1794,
  altitude: 110,
  status: 'Online',
  ...overrides,
})

describe('GroundStationSchema', () => {
  it('should parse a valid ground station', () => {
    const result = GroundStationSchema.safeParse(getValidStation())

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('M0SZT')
      expect(result.data.lat).toBe(53.0027)
      expect(result.data.lng).toBe(-2.1794)
      expect(result.data.status).toBe('Online')
    }
  })

  it('should reject station with missing required field', () => {
    const { name: _, ...incomplete } = getValidStation()
    const result = GroundStationSchema.safeParse(incomplete)

    expect(result.success).toBe(false)
  })

  it('should reject station with wrong type for lat', () => {
    const result = GroundStationSchema.safeParse(
      getValidStation({ lat: 'not-a-number' })
    )

    expect(result.success).toBe(false)
  })

  it('should reject station with wrong type for id', () => {
    const result = GroundStationSchema.safeParse(
      getValidStation({ id: 'abc' })
    )

    expect(result.success).toBe(false)
  })
})

describe('GroundStationResponseSchema', () => {
  it('should parse an array of valid stations', () => {
    const stations = [getValidStation(), getValidStation({ id: 35, name: 'Test2' })]
    const result = GroundStationResponseSchema.safeParse(stations)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
    }
  })

  it('should reject if any station in the array is invalid', () => {
    const stations = [getValidStation(), { invalid: true }]
    const result = GroundStationResponseSchema.safeParse(stations)

    expect(result.success).toBe(false)
  })

  it('should accept an empty array', () => {
    const result = GroundStationResponseSchema.safeParse([])

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(0)
    }
  })
})
