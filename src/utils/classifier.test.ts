import { describe, it, expect } from 'vitest'
import { classifySatellite } from './classifier'

describe('classifySatellite', () => {
  it('should classify ISS as a station', () => {
    expect(classifySatellite('ISS (ZARYA)')).toBe('station')
  })

  it('should classify TIANGONG as a station', () => {
    expect(classifySatellite('TIANGONG')).toBe('station')
  })

  it('should classify STARLINK satellites', () => {
    expect(classifySatellite('STARLINK-1234')).toBe('starlink')
  })

  it('should classify ONEWEB satellites', () => {
    expect(classifySatellite('ONEWEB-0123')).toBe('oneweb')
  })

  it('should classify GPS satellites', () => {
    expect(classifySatellite('GPS BIIR-2 (PRN 13)')).toBe('gps')
    expect(classifySatellite('NAVSTAR 43')).toBe('gps')
  })

  it('should classify GLONASS satellites', () => {
    expect(classifySatellite('COSMOS 2534 (GLONASS-M)')).toBe('glonass')
  })

  it('should classify GALILEO satellites', () => {
    expect(classifySatellite('GALILEO-FM10')).toBe('galileo')
  })

  it('should classify BEIDOU satellites', () => {
    expect(classifySatellite('BEIDOU-3 M17')).toBe('beidou')
  })

  it('should classify weather satellites', () => {
    expect(classifySatellite('NOAA 18')).toBe('weather')
    expect(classifySatellite('GOES 16')).toBe('weather')
    expect(classifySatellite('METEOSAT-11')).toBe('weather')
  })

  it('should classify debris', () => {
    expect(classifySatellite('COSMOS 1408 DEB')).toBe('debris')
    expect(classifySatellite('SL-16 DEB')).toBe('debris')
    expect(classifySatellite('IRIDIUM 33 DEB')).toBe('debris')
  })

  it('should classify rocket bodies', () => {
    expect(classifySatellite('CZ-3B R/B')).toBe('rocket-body')
    expect(classifySatellite('FALCON 9 R/B')).toBe('rocket-body')
    expect(classifySatellite('SL-16 R/B')).toBe('rocket-body')
  })

  it('should classify communications satellites', () => {
    expect(classifySatellite('IRIDIUM 180')).toBe('communications')
    expect(classifySatellite('INTELSAT 10-02')).toBe('communications')
    expect(classifySatellite('SES-17')).toBe('communications')
  })

  it('should classify earth observation satellites', () => {
    expect(classifySatellite('LANDSAT 9')).toBe('earth-observation')
    expect(classifySatellite('SENTINEL-2A')).toBe('earth-observation')
    expect(classifySatellite('WORLDVIEW-3')).toBe('earth-observation')
  })

  it('should classify unknown satellites as unknown', () => {
    expect(classifySatellite('RANDOM OBJECT 42')).toBe('unknown')
  })

  it('should be case insensitive', () => {
    expect(classifySatellite('starlink-5000')).toBe('starlink')
  })
})
