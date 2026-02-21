import { useMemo } from 'react'
import * as THREE from 'three'

const STAR_COUNT = 800

export const StarField = () => {
  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)

    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 80 + Math.random() * 20

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0x0d440d,
        size: 0.3,
        sizeAttenuation: true,
      }),
    [],
  )

  return <points geometry={geometry} material={material} />
}
