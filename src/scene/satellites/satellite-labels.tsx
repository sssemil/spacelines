import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useSatelliteStore } from '../../store/satellite-store'
import { useFilterStore } from '../../store/filter-store'
import { propagatePosition } from '../../orbital/propagator'
import { formatCoordinate, formatVelocity } from '../../utils/formatters'
import type { Satellite, SatellitePosition } from '../../types/satellite'

const LABEL_COUNT = 20
const UPDATE_INTERVAL_FRAMES = 90
const MIN_SCREEN_SEPARATION = 0.12
const EARTH_SCENE_RADIUS = 1.0

type LabelData = {
  readonly sat: Satellite
  readonly pos: SatellitePosition
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Courier New', monospace",
  fontSize: '9px',
  color: '#1a8a1a',
  background: 'rgba(0, 0, 0, 0.7)',
  border: '1px solid #0d440d',
  padding: '1px 4px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  lineHeight: '1.3',
}

type Vec3 = { readonly x: number; readonly y: number; readonly z: number }

export const isOccludedByEarth = (
  cameraPos: Vec3,
  satPos: Vec3,
  earthRadius: number,
): boolean => {
  const dx = satPos.x - cameraPos.x
  const dy = satPos.y - cameraPos.y
  const dz = satPos.z - cameraPos.z
  const rayLen = Math.sqrt(dx * dx + dy * dy + dz * dz)
  if (rayLen < 0.0001) return false

  const nx = dx / rayLen
  const ny = dy / rayLen
  const nz = dz / rayLen

  const ocx = -cameraPos.x
  const ocy = -cameraPos.y
  const ocz = -cameraPos.z

  const tca = ocx * nx + ocy * ny + ocz * nz
  if (tca < 0) return false

  const ocLenSq = ocx * ocx + ocy * ocy + ocz * ocz
  const dSq = ocLenSq - tca * tca
  if (dSq > earthRadius * earthRadius) return false

  const thc = Math.sqrt(earthRadius * earthRadius - dSq)
  const t0 = tca - thc

  return t0 > 0 && t0 < rayLen
}

const pickSpreadLabels = (
  candidates: readonly LabelData[],
  cameraPos: { readonly x: number; readonly y: number; readonly z: number },
): readonly LabelData[] => {
  const sorted = [...candidates].sort((a, b) => {
    const da = (a.pos.scene.x - cameraPos.x) ** 2 +
      (a.pos.scene.y - cameraPos.y) ** 2 +
      (a.pos.scene.z - cameraPos.z) ** 2
    const db = (b.pos.scene.x - cameraPos.x) ** 2 +
      (b.pos.scene.y - cameraPos.y) ** 2 +
      (b.pos.scene.z - cameraPos.z) ** 2
    return da - db
  })

  const picked: LabelData[] = []

  for (const candidate of sorted) {
    if (picked.length >= LABEL_COUNT) break

    const dx = candidate.pos.scene.x - cameraPos.x
    const dy = candidate.pos.scene.y - cameraPos.y
    const dz = candidate.pos.scene.z - cameraPos.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (dist < 0.01) continue

    const nx = dx / dist
    const ny = dy / dist
    const nz = dz / dist

    const tooClose = picked.some((p) => {
      const px = p.pos.scene.x - cameraPos.x
      const py = p.pos.scene.y - cameraPos.y
      const pz = p.pos.scene.z - cameraPos.z
      const pd = Math.sqrt(px * px + py * py + pz * pz)
      if (pd < 0.01) return true
      const dot = (nx * px + ny * py + nz * pz) / pd
      return dot > (1 - MIN_SCREEN_SEPARATION)
    })

    if (!tooClose) {
      picked.push(candidate)
    }
  }

  return picked
}

export const SatelliteLabels = () => {
  const frameRef = useRef(0)
  const [labels, setLabels] = useState<readonly LabelData[]>([])

  const satellites = useSatelliteStore((s) => s.satellites)
  const selectedId = useSatelliteStore((s) => s.selectedId)
  const activeCategories = useFilterStore((s) => s.activeCategories)
  const { camera } = useThree()

  useFrame(() => {
    frameRef.current++
    if (frameRef.current % UPDATE_INTERVAL_FRAMES !== 1) return

    const now = new Date()
    const camPos = camera.position

    camera.updateWorldMatrix(true, false)
    const frustum = new THREE.Frustum()
    const projScreenMatrix = new THREE.Matrix4()
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(projScreenMatrix)

    const camVec3 = { x: camPos.x, y: camPos.y, z: camPos.z }
    const satPoint = new THREE.Vector3()

    const candidates: LabelData[] = []
    for (const sat of satellites) {
      if (!activeCategories.has(sat.category)) continue
      if (sat.id === selectedId) continue

      const pos = propagatePosition(sat.satrec, now)
      if (!pos) continue

      satPoint.set(pos.scene.x, pos.scene.y, pos.scene.z)
      if (!frustum.containsPoint(satPoint)) continue

      if (isOccludedByEarth(camVec3, pos.scene, EARTH_SCENE_RADIUS)) continue

      candidates.push({ sat, pos })
    }

    const picked = pickSpreadLabels(candidates, camVec3)
    setLabels(picked)
  })

  return (
    <group>
      {labels.map((label) => (
        <Html
          key={label.sat.id}
          position={[
            label.pos.scene.x,
            label.pos.scene.y + 0.025,
            label.pos.scene.z,
          ]}
          center
          style={labelStyle}
        >
          <div>{label.sat.name}</div>
          <div>
            {formatCoordinate(label.pos.geodetic.latitude, 'lat')}{' '}
            {formatCoordinate(label.pos.geodetic.longitude, 'lon')}
          </div>
          <div>{formatVelocity(label.pos.velocity)}</div>
        </Html>
      ))}
    </group>
  )
}
