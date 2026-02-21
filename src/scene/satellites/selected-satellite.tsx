import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSatelliteStore } from '../../store/satellite-store'
import { useCameraStore } from '../../store/camera-store'
import { propagatePosition, computeSplitOrbitPath } from '../../orbital/propagator'
import { formatCoordinate, formatVelocity } from '../../utils/formatters'
import type { ScenePosition, SatellitePosition } from '../../types/satellite'

const ORBIT_COLOR = '#33ff33'
const ORBIT_SEGMENTS = 200

const toVec3Array = (points: readonly ScenePosition[]): THREE.Vector3[] =>
  points.map((p) => new THREE.Vector3(p.x, p.y, p.z))

const labelStyle: React.CSSProperties = {
  fontFamily: "'Courier New', monospace",
  fontSize: '10px',
  color: '#33ff33',
  background: 'rgba(0, 0, 0, 0.85)',
  border: '1px solid #1a8a1a',
  padding: '2px 5px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  lineHeight: '1.4',
}

export const SelectedSatellite = () => {
  const markerRef = useRef<THREE.Mesh>(null)
  const posRef = useRef<SatellitePosition | null>(null)
  const selectedSatellite = useSatelliteStore((s) => s.getSelectedSatellite())
  const flyTo = useCameraStore((s) => s.flyTo)

  const splitPath = useMemo(() => {
    if (!selectedSatellite) return null
    return computeSplitOrbitPath({
      satrec: selectedSatellite.satrec,
      date: new Date(),
      meanMotion: selectedSatellite.satrec.no * 1440 / (2 * Math.PI),
      segments: ORBIT_SEGMENTS,
    })
  }, [selectedSatellite])

  const pastPoints = useMemo(() => {
    if (!splitPath) return null
    return toVec3Array(splitPath.past)
  }, [splitPath])

  const futurePoints = useMemo(() => {
    if (!splitPath) return null
    return toVec3Array(splitPath.future)
  }, [splitPath])

  useFrame(() => {
    if (!selectedSatellite || !markerRef.current) return

    const pos = propagatePosition(selectedSatellite.satrec, new Date())
    if (!pos) return

    posRef.current = pos
    markerRef.current.position.set(pos.scene.x, pos.scene.y, pos.scene.z)
  })

  if (!selectedSatellite) return null

  const initialPos = propagatePosition(selectedSatellite.satrec, new Date())
  if (!initialPos) return null

  const pos = posRef.current ?? initialPos

  return (
    <group>
      <mesh
        ref={markerRef}
        position={[initialPos.scene.x, initialPos.scene.y, initialPos.scene.z]}
        onClick={() => flyTo(initialPos.scene)}
      >
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color={ORBIT_COLOR} />
      </mesh>

      <Html
        position={[initialPos.scene.x, initialPos.scene.y + 0.04, initialPos.scene.z]}
        center
        style={labelStyle}
      >
        <div>{selectedSatellite.name}</div>
        <div>
          {formatCoordinate(pos.geodetic.latitude, 'lat')}{' '}
          {formatCoordinate(pos.geodetic.longitude, 'lon')}
        </div>
        <div>{formatVelocity(pos.velocity)}</div>
      </Html>

      {pastPoints && pastPoints.length > 1 && (
        <Line
          points={pastPoints}
          color={ORBIT_COLOR}
          lineWidth={1.5}
          transparent
          opacity={0.7}
        />
      )}

      {futurePoints && futurePoints.length > 1 && (
        <Line
          points={futurePoints}
          color={ORBIT_COLOR}
          lineWidth={1.5}
          transparent
          opacity={0.4}
          dashed
          dashSize={0.05}
          gapSize={0.03}
        />
      )}
    </group>
  )
}
