import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gstime } from 'satellite.js'
import { drawLandMasses } from './land-texture'

const LAND_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson'

const LAND_RADIUS = 1.001

export const EarthLandmass = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    fetch(LAND_URL)
      .then((r) => r.json())
      .then((data) => {
        const canvas = document.createElement('canvas')
        drawLandMasses(canvas, data)
        setTexture(new THREE.CanvasTexture(canvas))
      })
      .catch(() => {})
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = gstime(new Date())
  })

  const material = useMemo(() => {
    if (!texture) return null
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    })
  }, [texture])

  if (!material) return null

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[LAND_RADIUS, 64, 32]} />
    </mesh>
  )
}
