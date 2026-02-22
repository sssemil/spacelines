import { describe, it, expect } from 'vitest'
import { createMareOutline, MARIA } from './moon-maria'

describe('createMareOutline', () => {
  it('should return a closed loop with numPoints + 1 vertices', () => {
    const points = createMareOutline({ centerLat: 0, centerLon: 0, angularRadius: 10, numPoints: 20, sphereRadius: 1 })

    expect(points).toHaveLength(21)
  })

  it('should place all points on the sphere surface', () => {
    const radius = 0.273
    const points = createMareOutline({ centerLat: 30, centerLon: -20, angularRadius: 15, numPoints: 30, sphereRadius: radius })

    points.forEach((p) => {
      const dist = Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2)
      expect(dist).toBeCloseTo(radius, 3)
    })
  })

  it('should close the loop (first and last point match)', () => {
    const points = createMareOutline({ centerLat: 10, centerLon: 30, angularRadius: 12, numPoints: 40, sphereRadius: 1 })

    const first = points[0]
    const last = points[points.length - 1]
    expect(first.x).toBeCloseTo(last.x, 5)
    expect(first.y).toBeCloseTo(last.y, 5)
    expect(first.z).toBeCloseTo(last.z, 5)
  })
})

describe('MARIA', () => {
  it('should define at least 4 maria', () => {
    expect(MARIA.length).toBeGreaterThanOrEqual(4)
  })
})
