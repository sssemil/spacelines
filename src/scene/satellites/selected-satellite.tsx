import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSatelliteStore } from '../../store/satellite-store'
import { useCameraStore } from '../../store/camera-store'
import { propagatePosition, computeOrbitPath } from '../../orbital/propagator'
import type { ScenePosition } from '../../types/satellite'

export const SelectedSatellite = () => {
  const markerRef = useRef<THREE.Mesh>(null)
  const selectedSatellite = useSatelliteStore((s) => s.getSelectedSatellite())
  const flyTo = useCameraStore((s) => s.flyTo)

  const orbitPath = useMemo(() => {
    if (!selectedSatellite) return null
    return computeOrbitPath({
      satrec: selectedSatellite.satrec,
      date: new Date(),
      meanMotion: selectedSatellite.satrec.no * 1440 / (2 * Math.PI),
      segments: 200,
    })
  }, [selectedSatellite])

  const orbitPoints = useMemo(() => {
    if (!orbitPath) return null
    return orbitPath.map(
      (p: ScenePosition) => new THREE.Vector3(p.x, p.y, p.z),
    )
  }, [orbitPath])

  useFrame(() => {
    if (!selectedSatellite || !markerRef.current) return

    const pos = propagatePosition(selectedSatellite.satrec, new Date())
    if (!pos) return

    markerRef.current.position.set(pos.scene.x, pos.scene.y, pos.scene.z)
  })

  if (!selectedSatellite) return null

  const initialPos = propagatePosition(selectedSatellite.satrec, new Date())
  if (!initialPos) return null

  return (
    <group>
      <mesh
        ref={markerRef}
        position={[initialPos.scene.x, initialPos.scene.y, initialPos.scene.z]}
        onClick={() => flyTo(initialPos.scene)}
      >
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
      </mesh>

      <Html
        position={[initialPos.scene.x, initialPos.scene.y + 0.04, initialPos.scene.z]}
        center
        style={{
          color: '#00ffff',
          fontSize: '11px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
          pointerEvents: 'none',
        }}
      >
        {selectedSatellite.name}
      </Html>

      {orbitPoints && (
        <Line
          points={orbitPoints}
          color="#00ffff"
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      )}
    </group>
  )
}
