import { describe, it, expect } from 'vitest'
import { SpatialIndex } from './spatial-index'

describe('SpatialIndex', () => {
  it('should find the nearest point to a given position', () => {
    const index = new SpatialIndex(10)
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      5, 5, 5,
    ])

    index.build(positions, 4)

    const nearest = index.findNearest(0.9, 0.1, 0)

    expect(nearest).toBe(1)
  })

  it('should return -1 when no points are indexed', () => {
    const index = new SpatialIndex(10)
    index.build(new Float32Array(0), 0)

    const nearest = index.findNearest(0, 0, 0)

    expect(nearest).toBe(-1)
  })

  it('should handle threshold distance', () => {
    const index = new SpatialIndex(10)
    const positions = new Float32Array([
      10, 10, 10,
    ])

    index.build(positions, 1)

    const nearest = index.findNearest(0, 0, 0, 1)

    expect(nearest).toBe(-1)
  })

  it('should find points within threshold', () => {
    const index = new SpatialIndex(10)
    const positions = new Float32Array([
      0.5, 0.5, 0.5,
    ])

    index.build(positions, 1)

    const nearest = index.findNearest(0, 0, 0, 2)

    expect(nearest).toBe(0)
  })
})
