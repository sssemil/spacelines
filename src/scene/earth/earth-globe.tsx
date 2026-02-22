import { useMemo, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useCameraStore } from '../../store/camera-store'
import { useSatelliteStore } from '../../store/satellite-store'

const WIRE_COLOR = 0x1a6b1a
const FAR_DISTANCE_THRESHOLD = 10

export const EarthGlobe = () => {
  const { camera } = useThree()
  const flyTo = useCameraStore((s) => s.flyTo)
  const clearSelection = useSatelliteStore((s) => s.clearSelection)

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: WIRE_COLOR,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      }),
    [],
  )

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (camera.position.length() < FAR_DISTANCE_THRESHOLD) return

      event.stopPropagation()
      clearSelection()
      flyTo({ x: 0, y: 0.5, z: 1 })
    },
    [camera, flyTo, clearSelection],
  )

  return (
    <group>
      <mesh material={wireMaterial} onClick={handleClick}>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>

      <mesh visible={false} onClick={handleClick}>
        <sphereGeometry args={[3, 8, 8]} />
      </mesh>
    </group>
  )
}
