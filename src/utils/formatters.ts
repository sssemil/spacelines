export const formatAltitude = (altitudeKm: number): string => {
  const formatted = altitudeKm.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  return `${formatted} km`
}

export const formatVelocity = (velocityKmS: number): string => {
  return `${velocityKmS.toFixed(2)} km/s`
}

export const formatCoordinate = (
  value: number,
  axis: 'lat' | 'lon',
): string => {
  const absValue = Math.abs(value)
  const suffix =
    axis === 'lat'
      ? value >= 0 ? 'N' : 'S'
      : value >= 0 ? 'E' : 'W'
  return `${absValue.toFixed(2)}° ${suffix}`
}

export const formatCount = (count: number): string => {
  return count.toLocaleString('en-US')
}
