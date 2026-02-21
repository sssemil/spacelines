import { describe, it, expect } from 'vitest'
import { twoline2satrec } from 'satellite.js'
import { propagatePosition, computeOrbitPath } from './propagator'

const ISS_TLE_LINE1 = '1 25544U 98067A   24015.50000000  .00002182  00000-0  36771-3 0  9993'
const ISS_TLE_LINE2 = '2 25544  51.6461 247.4627 0006703 130.5360 259.8238 15.49560532438597'

const getIssSatrec = () => twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2)

describe('propagatePosition', () => {
  it('should return ECI position for a given date', () => {
    const satrec = getIssSatrec()
    const date = new Date('2024-01-15T12:00:00.000Z')
    const result = propagatePosition(satrec, date)

    expect(result).not.toBeNull()
    if (result) {
      expect(typeof result.eci.x).toBe('number')
      expect(typeof result.eci.y).toBe('number')
      expect(typeof result.eci.z).toBe('number')
      expect(Number.isFinite(result.eci.x)).toBe(true)
    }
  })

  it('should return scene coordinates scaled from ECI', () => {
    const satrec = getIssSatrec()
    const date = new Date('2024-01-15T12:00:00.000Z')
    const result = propagatePosition(satrec, date)

    expect(result).not.toBeNull()
    if (result) {
      const distance = Math.sqrt(
        result.scene.x ** 2 + result.scene.y ** 2 + result.scene.z ** 2
      )
      expect(distance).toBeGreaterThan(1)
      expect(distance).toBeLessThan(2)
    }
  })

  it('should return geodetic coordinates', () => {
    const satrec = getIssSatrec()
    const date = new Date('2024-01-15T12:00:00.000Z')
    const result = propagatePosition(satrec, date)

    expect(result).not.toBeNull()
    if (result) {
      expect(result.geodetic.latitude).toBeGreaterThanOrEqual(-90)
      expect(result.geodetic.latitude).toBeLessThanOrEqual(90)
      expect(result.geodetic.longitude).toBeGreaterThanOrEqual(-180)
      expect(result.geodetic.longitude).toBeLessThanOrEqual(180)
      expect(result.geodetic.altitude).toBeGreaterThan(300)
      expect(result.geodetic.altitude).toBeLessThan(500)
    }
  })

  it('should return velocity in km/s', () => {
    const satrec = getIssSatrec()
    const date = new Date('2024-01-15T12:00:00.000Z')
    const result = propagatePosition(satrec, date)

    expect(result).not.toBeNull()
    if (result) {
      expect(result.velocity).toBeGreaterThan(7)
      expect(result.velocity).toBeLessThan(8)
    }
  })

  it('should return null for a propagation error', () => {
    const satrec = getIssSatrec()
    const farFutureDate = new Date('2099-01-01T00:00:00.000Z')
    const result = propagatePosition(satrec, farFutureDate)

    expect(result).toBeNull()
  })
})

describe('computeOrbitPath', () => {
  it('should return an array of scene positions for one full orbit', () => {
    const satrec = getIssSatrec()
    const date = new Date('2024-01-15T12:00:00.000Z')
    const meanMotion = 15.49560532

    const path = computeOrbitPath({ satrec, date, meanMotion, segments: 100 })

    expect(path.length).toBe(100)
    path.forEach((point) => {
      expect(Number.isFinite(point.x)).toBe(true)
      expect(Number.isFinite(point.y)).toBe(true)
      expect(Number.isFinite(point.z)).toBe(true)
    })
  })

  it('should produce a closed loop (first and last points should be near each other)', () => {
    const satrec = getIssSatrec()
    const date = new Date('2024-01-15T12:00:00.000Z')
    const meanMotion = 15.49560532

    const path = computeOrbitPath({ satrec, date, meanMotion, segments: 100 })

    const first = path[0]
    const last = path[path.length - 1]
    const dist = Math.sqrt(
      (first.x - last.x) ** 2 + (first.y - last.y) ** 2 + (first.z - last.z) ** 2
    )
    expect(dist).toBeLessThan(0.1)
  })
})
