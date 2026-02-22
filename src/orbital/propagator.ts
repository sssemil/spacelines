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

type SplitOrbitPath = {
  readonly past: readonly ScenePosition[]
  readonly future: readonly ScenePosition[]
}

export const computeSplitOrbitPath = ({
  satrec,
  date,
  meanMotion,
  segments,
}: ComputeOrbitPathOptions): SplitOrbitPath => {
  const orbitalPeriodMs = (24 * 60 * 60 * 1000) / meanMotion
  const halfPeriodMs = orbitalPeriodMs / 2
  const now = date.getTime()
  const halfSegments = Math.floor(segments / 2)

  const nowPos = propagatePosition(satrec, new Date(now))

  const past: ScenePosition[] = []
  for (let i = 0; i < halfSegments; i++) {
    const t = now - halfPeriodMs + (i / halfSegments) * halfPeriodMs
    const pos = propagatePosition(satrec, new Date(t))
    if (pos) {
      past.push(pos.scene)
    }
  }
  if (nowPos) {
    past.push(nowPos.scene)
  }

  const future: ScenePosition[] = nowPos ? [nowPos.scene] : []
  for (let i = 1; i < halfSegments; i++) {
    const t = now + (i / halfSegments) * halfPeriodMs
    const pos = propagatePosition(satrec, new Date(t))
    if (pos) {
      future.push(pos.scene)
    }
  }

  return { past, future }
}
