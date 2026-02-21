import type { SatelliteCategory } from '../types/satellite'

type RGB = readonly [number, number, number]

const GREEN: RGB = [0.08, 0.4, 0.08]
const DIM_GREEN: RGB = [0.04, 0.2, 0.04]

export const getCategoryColor = (category: SatelliteCategory): RGB => {
  if (category === 'debris' || category === 'rocket-body') return DIM_GREEN
  return GREEN
}

export const getCategorySize = (category: SatelliteCategory): number => {
  if (category === 'station') return 2
  if (category === 'debris' || category === 'rocket-body') return 0.4
  return 0.7
}
