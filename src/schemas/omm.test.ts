import { describe, it, expect } from 'vitest'
import { OmmRecordSchema, OmmResponseSchema } from './omm'

const getValidOmmRecord = (overrides?: Record<string, unknown>) => ({
  OBJECT_NAME: 'ISS (ZARYA)',
  OBJECT_ID: '1998-067A',
  EPOCH: '2024-01-15T12:00:00.000000',
  MEAN_MOTION: 15.49560532,
  ECCENTRICITY: 0.0006703,
  INCLINATION: 51.6461,
  RA_OF_ASC_NODE: 247.4627,
  ARG_OF_PERICENTER: 130.536,
  MEAN_ANOMALY: 259.8238,
  EPHEMERIS_TYPE: 0,
  CLASSIFICATION_TYPE: 'U',
  NORAD_CAT_ID: 25544,
  ELEMENT_SET_NO: 999,
  REV_AT_EPOCH: 43859,
  BSTAR: 0.00036771,
  MEAN_MOTION_DOT: 0.00002182,
  MEAN_MOTION_DDOT: 0,
  ...overrides,
})

describe('OmmRecordSchema', () => {
  it('should parse a valid OMM record', () => {
    const record = getValidOmmRecord()
    const result = OmmRecordSchema.safeParse(record)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.OBJECT_NAME).toBe('ISS (ZARYA)')
      expect(result.data.NORAD_CAT_ID).toBe(25544)
    }
  })

  it('should reject record with missing required field', () => {
    const { OBJECT_NAME: _, ...incomplete } = getValidOmmRecord()
    const result = OmmRecordSchema.safeParse(incomplete)

    expect(result.success).toBe(false)
  })

  it('should reject record with wrong type for numeric field', () => {
    const result = OmmRecordSchema.safeParse(
      getValidOmmRecord({ MEAN_MOTION: 'not-a-number' })
    )

    expect(result.success).toBe(false)
  })

  it('should accept scientific notation in numeric fields', () => {
    const result = OmmRecordSchema.safeParse(
      getValidOmmRecord({ BSTAR: 9.982e-5 })
    )

    expect(result.success).toBe(true)
  })
})

describe('OmmResponseSchema', () => {
  it('should parse an array of valid OMM records', () => {
    const records = [getValidOmmRecord(), getValidOmmRecord({ NORAD_CAT_ID: 25545 })]
    const result = OmmResponseSchema.safeParse(records)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
    }
  })

  it('should reject if any record in the array is invalid', () => {
    const records = [getValidOmmRecord(), { invalid: true }]
    const result = OmmResponseSchema.safeParse(records)

    expect(result.success).toBe(false)
  })

  it('should accept an empty array', () => {
    const result = OmmResponseSchema.safeParse([])

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(0)
    }
  })
})
