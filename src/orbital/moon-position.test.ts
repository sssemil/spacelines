import { describe, it, expect } from 'vitest'
import { calculateMoonPosition, computeSplitMoonOrbitPath } from './moon-position'

const sceneDistance = (pos: { x: number; y: number; z: number }) =>
  Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2)

describe('calculateMoonPosition', () => {
  it('should return an object with x, y, z, and distanceKm', () => {
    const result = calculateMoonPosition(new Date('2024-06-15T12:00:00Z'))

    expect(typeof result.x).toBe('number')
    expect(typeof result.y).toBe('number')
    expect(typeof result.z).toBe('number')
    expect(typeof result.distanceKm).toBe('number')
  })

  it('should return distance within valid lunar orbital range', () => {
    const dates = [
      new Date('2024-01-15T00:00:00Z'),
      new Date('2024-06-15T12:00:00Z'),
      new Date('2024-12-01T06:00:00Z'),
    ]

    dates.forEach((date) => {
      const result = calculateMoonPosition(date)
      expect(result.distanceKm).toBeGreaterThan(356500)
      expect(result.distanceKm).toBeLessThan(406700)
    })
  })

  it('should place the Moon at approximately 60 Earth radii in scene units', () => {
    const result = calculateMoonPosition(new Date('2024-06-15T12:00:00Z'))
    const dist = sceneDistance(result)

    expect(dist).toBeGreaterThan(55)
    expect(dist).toBeLessThan(65)
  })

  it('should produce significant displacement over half a lunar month', () => {
    const pos1 = calculateMoonPosition(new Date('2024-06-01T00:00:00Z'))
    const pos2 = calculateMoonPosition(new Date('2024-06-15T00:00:00Z'))

    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    const dz = pos2.z - pos1.z
    const displacement = Math.sqrt(dx * dx + dy * dy + dz * dz)

    expect(displacement).toBeGreaterThan(10)
  })

  it('should place the Moon roughly opposite the Sun at a full moon', () => {
    const fullMoonDate = new Date('2024-03-25T07:00:00Z')
    const moonPos = calculateMoonPosition(fullMoonDate)

    const dist = sceneDistance(moonPos)
    const moonDirX = moonPos.x / dist

    expect(moonDirX).toBeLessThan(0)
  })
})

describe('computeSplitMoonOrbitPath', () => {
  it('should return past and future arrays', () => {
    const result = computeSplitMoonOrbitPath({
      date: new Date('2024-06-15T12:00:00Z'),
      segments: 100,
    })

    expect(Array.isArray(result.past)).toBe(true)
    expect(Array.isArray(result.future)).toBe(true)
  })

  it('should have past and future arrays with expected lengths', () => {
    const result = computeSplitMoonOrbitPath({
      date: new Date('2024-06-15T12:00:00Z'),
      segments: 100,
    })

    expect(result.past.length).toBe(51)
    expect(result.future.length).toBe(50)
  })

  it('should return points at approximately lunar orbital distance', () => {
    const result = computeSplitMoonOrbitPath({
      date: new Date('2024-06-15T12:00:00Z'),
      segments: 50,
    })

    ;[...result.past, ...result.future].forEach((p) => {
      const dist = sceneDistance(p)
      expect(dist).toBeGreaterThan(55)
      expect(dist).toBeLessThan(65)
    })
  })

  it('should have past array ending exactly at the current Moon position', () => {
    const date = new Date('2024-06-15T12:00:00Z')
    const result = computeSplitMoonOrbitPath({ date, segments: 200 })
    const currentPos = calculateMoonPosition(date)

    const lastPast = result.past[result.past.length - 1]

    expect(lastPast.x).toBeCloseTo(currentPos.x, 10)
    expect(lastPast.y).toBeCloseTo(currentPos.y, 10)
    expect(lastPast.z).toBeCloseTo(currentPos.z, 10)
  })

  it('should have future array starting exactly at the current Moon position', () => {
    const date = new Date('2024-06-15T12:00:00Z')
    const result = computeSplitMoonOrbitPath({ date, segments: 200 })
    const currentPos = calculateMoonPosition(date)

    const firstFuture = result.future[0]

    expect(firstFuture.x).toBeCloseTo(currentPos.x, 10)
    expect(firstFuture.y).toBeCloseTo(currentPos.y, 10)
    expect(firstFuture.z).toBeCloseTo(currentPos.z, 10)
  })
})
