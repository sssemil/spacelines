import { describe, it, expect } from 'vitest'
import { geoToCanvasCoords, TEXTURE_WIDTH, TEXTURE_HEIGHT } from './land-texture'

describe('geoToCanvasCoords', () => {
  it('should map origin (0, 0) to canvas center', () => {
    const result = geoToCanvasCoords(0, 0)

    expect(result.x).toBeCloseTo(TEXTURE_WIDTH / 2, 0)
    expect(result.y).toBeCloseTo(TEXTURE_HEIGHT / 2, 0)
  })

  it('should map (-180, 90) to top-right after horizontal flip', () => {
    const result = geoToCanvasCoords(-180, 90)

    expect(result.x).toBeCloseTo(TEXTURE_WIDTH, 0)
    expect(result.y).toBeCloseTo(0, 0)
  })

  it('should map (180, -90) to bottom-left after horizontal flip', () => {
    const result = geoToCanvasCoords(180, -90)

    expect(result.x).toBeCloseTo(0, 0)
    expect(result.y).toBeCloseTo(TEXTURE_HEIGHT, 0)
  })
})
