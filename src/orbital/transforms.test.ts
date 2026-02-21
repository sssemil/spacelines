import { describe, it, expect } from 'vitest'
import { eciToScene, EARTH_RADIUS_KM, SCENE_SCALE } from './transforms'

describe('eciToScene', () => {
  it('should scale ECI kilometers to scene units', () => {
    const eci = { x: EARTH_RADIUS_KM, y: 0, z: 0 }
    const scene = eciToScene(eci)

    expect(scene.x).toBeCloseTo(EARTH_RADIUS_KM * SCENE_SCALE)
    expect(scene.y).toBeCloseTo(0)
    expect(scene.z).toBeCloseTo(0)
  })

  it('should swap Y and Z axes for Three.js coordinate system', () => {
    const eci = { x: 0, y: 1000, z: 2000 }
    const scene = eciToScene(eci)

    expect(scene.x).toBeCloseTo(0)
    expect(scene.y).toBeCloseTo(2000 * SCENE_SCALE)
    expect(scene.z).toBeCloseTo(-1000 * SCENE_SCALE)
  })

  it('should handle the origin point', () => {
    const scene = eciToScene({ x: 0, y: 0, z: 0 })

    expect(scene.x).toBeCloseTo(0)
    expect(scene.y).toBeCloseTo(0)
    expect(scene.z).toBeCloseTo(0)
  })

  it('should produce an Earth surface point at unit radius', () => {
    const surfacePoint = { x: EARTH_RADIUS_KM, y: 0, z: 0 }
    const scene = eciToScene(surfacePoint)
    const distance = Math.sqrt(scene.x ** 2 + scene.y ** 2 + scene.z ** 2)

    expect(distance).toBeCloseTo(1)
  })
})

describe('constants', () => {
  it('should have Earth radius as 6371 km', () => {
    expect(EARTH_RADIUS_KM).toBe(6371)
  })

  it('should set SCENE_SCALE so Earth radius = 1 unit', () => {
    expect(SCENE_SCALE).toBeCloseTo(1 / 6371)
  })
})
