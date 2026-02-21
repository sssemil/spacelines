import { describe, it, expect } from 'vitest'
import {
  formatAltitude,
  formatVelocity,
  formatCoordinate,
  formatCount,
} from './formatters'

describe('formatAltitude', () => {
  it('should format altitude in km with 1 decimal', () => {
    expect(formatAltitude(408.123)).toBe('408.1 km')
  })

  it('should handle zero altitude', () => {
    expect(formatAltitude(0)).toBe('0.0 km')
  })

  it('should handle high orbits', () => {
    expect(formatAltitude(35786.5)).toBe('35,786.5 km')
  })
})

describe('formatVelocity', () => {
  it('should format velocity in km/s with 2 decimals', () => {
    expect(formatVelocity(7.66)).toBe('7.66 km/s')
  })

  it('should pad to 2 decimals', () => {
    expect(formatVelocity(3)).toBe('3.00 km/s')
  })
})

describe('formatCoordinate', () => {
  it('should format latitude with N/S suffix', () => {
    expect(formatCoordinate(51.6, 'lat')).toBe('51.60° N')
  })

  it('should format negative latitude with S suffix', () => {
    expect(formatCoordinate(-33.8, 'lat')).toBe('33.80° S')
  })

  it('should format longitude with E/W suffix', () => {
    expect(formatCoordinate(100.5, 'lon')).toBe('100.50° E')
  })

  it('should format negative longitude with W suffix', () => {
    expect(formatCoordinate(-73.9, 'lon')).toBe('73.90° W')
  })

  it('should handle zero coordinate', () => {
    expect(formatCoordinate(0, 'lat')).toBe('0.00° N')
    expect(formatCoordinate(0, 'lon')).toBe('0.00° E')
  })
})

describe('formatCount', () => {
  it('should format small numbers without separator', () => {
    expect(formatCount(42)).toBe('42')
  })

  it('should format thousands with comma separator', () => {
    expect(formatCount(1234)).toBe('1,234')
  })

  it('should format tens of thousands', () => {
    expect(formatCount(30000)).toBe('30,000')
  })
})
