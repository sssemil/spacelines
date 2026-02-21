import {
  propagate,
  gstime,
  eciToGeodetic,
  degreesLong,
  degreesLat,
} from 'satellite.js'
import type { SatRec } from 'satellite.js'
import type { SatellitePosition, ScenePosition } from '../types/satellite'
import { eciToScene } from './transforms'

export const propagatePosition = (
  satrec: SatRec,
  date: Date,
): SatellitePosition | null => {
  const result = propagate(satrec, date)

  if (
    !result ||
    !result.position ||
    typeof result.position === 'boolean' ||
    !result.velocity ||
    typeof result.velocity === 'boolean'
  ) {
    return null
  }

  const positionEci = result.position
  const velocityEci = result.velocity

  const gmst = gstime(date)
  const geodetic = eciToGeodetic(positionEci, gmst)

  const velocity = Math.sqrt(
    velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2,
  )

  return {
    eci: { x: positionEci.x, y: positionEci.y, z: positionEci.z },
    scene: eciToScene(positionEci),
    geodetic: {
      latitude: degreesLat(geodetic.latitude),
      longitude: degreesLong(geodetic.longitude),
      altitude: geodetic.height,
    },
    velocity,
  }
}

type ComputeOrbitPathOptions = {
  readonly satrec: SatRec
  readonly date: Date
  readonly meanMotion: number
  readonly segments: number
}

export const computeOrbitPath = ({
  satrec,
  date,
  meanMotion,
  segments,
}: ComputeOrbitPathOptions): readonly ScenePosition[] => {
  const orbitalPeriodMs = (24 * 60 * 60 * 1000) / meanMotion
  const startTime = date.getTime()

  const points: ScenePosition[] = []
  for (let i = 0; i < segments; i++) {
    const t = startTime + (i / segments) * orbitalPeriodMs
    const pos = propagatePosition(satrec, new Date(t))
    if (pos) {
      points.push(pos.scene)
    }
  }

  return points
}
