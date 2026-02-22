const DEG_TO_RAD = Math.PI / 180

type MareDefinition = {
  readonly centerLat: number
  readonly centerLon: number
  readonly angularRadius: number
}

type CreateMareOutlineOptions = {
  readonly centerLat: number
  readonly centerLon: number
  readonly angularRadius: number
  readonly numPoints: number
  readonly sphereRadius: number
}

type Point3 = {
  readonly x: number
  readonly y: number
  readonly z: number
}

export const createMareOutline = ({
  centerLat,
  centerLon,
  angularRadius,
  numPoints,
  sphereRadius,
}: CreateMareOutlineOptions): readonly Point3[] => {
  const lat0 = centerLat * DEG_TO_RAD
  const lon0 = centerLon * DEG_TO_RAD
  const r = angularRadius * DEG_TO_RAD

  const sinLat0 = Math.sin(lat0)
  const cosLat0 = Math.cos(lat0)
  const cosR = Math.cos(r)
  const sinR = Math.sin(r)

  const points: Point3[] = []
  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * 2 * Math.PI

    const lat = Math.asin(sinLat0 * cosR + cosLat0 * sinR * Math.cos(theta))
    const lon = lon0 + Math.atan2(
      Math.sin(theta) * sinR * cosLat0,
      cosR - sinLat0 * Math.sin(lat),
    )

    points.push({
      x: Math.cos(lat) * Math.sin(lon) * sphereRadius,
      y: Math.sin(lat) * sphereRadius,
      z: Math.cos(lat) * Math.cos(lon) * sphereRadius,
    })
  }

  return points
}

export const MARIA: readonly MareDefinition[] = [
  { centerLat: 18, centerLon: -57, angularRadius: 22 },
  { centerLat: 33, centerLon: -18, angularRadius: 16 },
  { centerLat: 28, centerLon: 17, angularRadius: 10 },
  { centerLat: 9, centerLon: 31, angularRadius: 12 },
  { centerLat: 17, centerLon: 59, angularRadius: 7 },
]
