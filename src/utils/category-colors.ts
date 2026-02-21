import type { SatelliteCategory } from '../types/satellite'

type RGB = readonly [number, number, number]

const CATEGORY_COLORS: Record<SatelliteCategory, RGB> = {
  station: [1.0, 0.9, 0.2],
  starlink: [0.3, 0.6, 1.0],
  oneweb: [0.2, 0.8, 0.6],
  gps: [0.0, 1.0, 0.5],
  glonass: [1.0, 0.4, 0.3],
  galileo: [0.9, 0.6, 0.1],
  beidou: [1.0, 0.3, 0.6],
  weather: [0.4, 0.9, 1.0],
  'earth-observation': [0.6, 0.8, 0.2],
  communications: [0.7, 0.5, 1.0],
  debris: [0.5, 0.5, 0.5],
  'rocket-body': [0.6, 0.4, 0.3],
  unknown: [0.4, 0.4, 0.4],
}

export const getCategoryColor = (category: SatelliteCategory): RGB =>
  CATEGORY_COLORS[category]

export const getCategorySize = (category: SatelliteCategory): number => {
  if (category === 'station') return 6
  if (category === 'debris' || category === 'rocket-body') return 1.5
  return 3
}
