import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { fetchSatelliteGroup } from './celestrak-client'
import { CELESTRAK_BASE_URL } from './groups'

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

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetchSatelliteGroup', () => {
  it('should fetch and parse valid OMM data from CelesTrak', async () => {
    const mockData = [
      getValidOmmRecord(),
      getValidOmmRecord({ NORAD_CAT_ID: 25545, OBJECT_NAME: 'ISS DEB' }),
    ]

    server.use(
      http.get(CELESTRAK_BASE_URL, () => {
        return HttpResponse.json(mockData)
      }),
    )

    const result = await fetchSatelliteGroup('stations')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
      expect(result.data[0].OBJECT_NAME).toBe('ISS (ZARYA)')
    }
  })

  it('should return error for invalid API response data', async () => {
    server.use(
      http.get(CELESTRAK_BASE_URL, () => {
        return HttpResponse.json([{ invalid: true }])
      }),
    )

    const result = await fetchSatelliteGroup('stations')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it('should return error for network failure', async () => {
    server.use(
      http.get(CELESTRAK_BASE_URL, () => {
        return HttpResponse.error()
      }),
    )

    const result = await fetchSatelliteGroup('stations')

    expect(result.success).toBe(false)
  })

  it('should return error for non-200 HTTP status', async () => {
    server.use(
      http.get(CELESTRAK_BASE_URL, () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    const result = await fetchSatelliteGroup('stations')

    expect(result.success).toBe(false)
  })
})
