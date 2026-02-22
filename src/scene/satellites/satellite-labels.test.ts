import { describe, it, expect } from 'vitest'
import { isOccludedByEarth } from './satellite-labels'

describe('isOccludedByEarth', () => {
  const EARTH_RADIUS = 1.0

  it('should return false when satellite is between camera and Earth', () => {
    const cameraPos = { x: 0, y: 0, z: 5 }
    const satPos = { x: 0, y: 0, z: 2 }

    expect(isOccludedByEarth(cameraPos, satPos, EARTH_RADIUS)).toBe(false)
  })

  it('should return true when satellite is on the far side of Earth from camera', () => {
    const cameraPos = { x: 0, y: 0, z: 5 }
    const satPos = { x: 0, y: 0, z: -2 }

    expect(isOccludedByEarth(cameraPos, satPos, EARTH_RADIUS)).toBe(true)
  })

  it('should return false when satellite is near limb but line of sight clears Earth', () => {
    const cameraPos = { x: 0, y: 0, z: 5 }
    const satPos = { x: 1.01, y: 0, z: 1 }

    expect(isOccludedByEarth(cameraPos, satPos, EARTH_RADIUS)).toBe(false)
  })

  it('should return true when camera is near surface and satellite is on opposite side', () => {
    const cameraPos = { x: 0, y: 0, z: 1.5 }
    const satPos = { x: 0, y: 0, z: -1.5 }

    expect(isOccludedByEarth(cameraPos, satPos, EARTH_RADIUS)).toBe(true)
  })

  it('should return false when satellite is off to the side, not behind Earth', () => {
    const cameraPos = { x: 0, y: 0, z: 5 }
    const satPos = { x: 3, y: 0, z: 0 }

    expect(isOccludedByEarth(cameraPos, satPos, EARTH_RADIUS)).toBe(false)
  })

  it('should return true when ray just clips inside Earth sphere', () => {
    const cameraPos = { x: 0, y: 0, z: 5 }
    const satPos = { x: 0, y: 0.5, z: -3 }

    expect(isOccludedByEarth(cameraPos, satPos, EARTH_RADIUS)).toBe(true)
  })
})
