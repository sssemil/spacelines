import { describe, it, expect } from 'vitest'
import { calculateSunDirection } from './sun-direction'

const vectorLength = (v: { x: number; y: number; z: number }) =>
  Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)

describe('calculateSunDirection', () => {
  it('should return a unit vector for any date', () => {
    const direction = calculateSunDirection(new Date('2024-06-15T12:00:00Z'))

    expect(vectorLength(direction)).toBeCloseTo(1.0, 4)
  })

  it('should point toward positive x near March equinox', () => {
    const direction = calculateSunDirection(new Date('2024-03-20T12:00:00Z'))

    expect(direction.x).toBeCloseTo(1, 0)
    expect(direction.y).toBeCloseTo(0, 0)
  })

  it('should have positive y (declination) near June solstice', () => {
    const direction = calculateSunDirection(new Date('2024-06-21T12:00:00Z'))

    expect(direction.y).toBeGreaterThan(0.3)
  })
})
