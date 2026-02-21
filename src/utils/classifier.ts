import type { SatelliteCategory } from '../types/satellite'

type ClassificationRule = {
  readonly pattern: RegExp
  readonly category: SatelliteCategory
}

const CLASSIFICATION_RULES: readonly ClassificationRule[] = [
  { pattern: /\bDEB\b/, category: 'debris' },
  { pattern: /\bR\/B\b/, category: 'rocket-body' },
  { pattern: /\b(ISS|ZARYA|TIANGONG|CSS)\b/, category: 'station' },
  { pattern: /\bSTARLINK\b/, category: 'starlink' },
  { pattern: /\bONEWEB\b/, category: 'oneweb' },
  { pattern: /\b(GPS|NAVSTAR)\b/, category: 'gps' },
  { pattern: /\bGLONASS\b/, category: 'glonass' },
  { pattern: /\bGALILEO\b/, category: 'galileo' },
  { pattern: /\bBEIDOU\b/, category: 'beidou' },
  { pattern: /\b(NOAA|GOES|METEOSAT|DMSP|FENGYUN|HIMAWARI)\b/, category: 'weather' },
  { pattern: /\b(LANDSAT|SENTINEL|WORLDVIEW|SPOT|PLEIADES|TERRA|AQUA)\b/, category: 'earth-observation' },
  { pattern: /\b(IRIDIUM|INTELSAT|SES|INMARSAT|GLOBALSTAR|ORBCOMM|VIASAT|TELESAT)\b/, category: 'communications' },
]

export const classifySatellite = (name: string): SatelliteCategory => {
  const upperName = name.toUpperCase()
  const match = CLASSIFICATION_RULES.find((rule) => rule.pattern.test(upperName))
  return match?.category ?? 'unknown'
}
