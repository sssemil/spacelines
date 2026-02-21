import { useMemo } from 'react'
import * as THREE from 'three'

const WIRE_COLOR = 0x1a6b1a

export const EarthGlobe = () => {
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

  return (
    <mesh material={wireMaterial}>
      <sphereGeometry args={[1, 24, 16]} />
    </mesh>
  )
}
