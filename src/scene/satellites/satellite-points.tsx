import { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { propagate } from 'satellite.js'
import { useSatelliteStore } from '../../store/satellite-store'
import { useFilterStore } from '../../store/filter-store'
import { createPointMaterial } from './point-material'
import { getCategoryColor, getCategorySize } from '../../utils/category-colors'
import { SpatialIndex } from '../../utils/spatial-index'
import { SCENE_SCALE } from '../../orbital/transforms'

const MAX_SATELLITES = 50000

export const SatellitePoints = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const spatialIndexRef = useRef(new SpatialIndex(0.5))

  const satellites = useSatelliteStore((s) => s.satellites)
  const selectSatellite = useSatelliteStore((s) => s.selectSatellite)
  const activeCategories = useFilterStore((s) => s.activeCategories)

  const material = useMemo(() => createPointMaterial(), [])

  const buffers = useMemo(() => {
    const positions = new Float32Array(MAX_SATELLITES * 3)
    const colors = new Float32Array(MAX_SATELLITES * 3)
    const sizes = new Float32Array(MAX_SATELLITES)
    return { positions, colors, sizes }
  }, [])

  const filteredIndices = useMemo(() => {
    const indices: number[] = []
    satellites.forEach((sat, i) => {
      if (activeCategories.has(sat.category)) {
        indices.push(i)
      }
    })
    return indices
  }, [satellites, activeCategories])

  useFrame(() => {
    if (!pointsRef.current || satellites.length === 0) return

    const geometry = pointsRef.current.geometry
    const now = new Date()

    let visibleCount = 0

    for (const satIndex of filteredIndices) {
      const sat = satellites[satIndex]
      const result = propagate(sat.satrec, now)

      if (!result || typeof result.position === 'boolean' || !result.position) {
        continue
      }

      const pos = result.position
      const idx = visibleCount * 3

      buffers.positions[idx] = pos.x * SCENE_SCALE
      buffers.positions[idx + 1] = pos.z * SCENE_SCALE
      buffers.positions[idx + 2] = -pos.y * SCENE_SCALE

      const color = getCategoryColor(sat.category)
      buffers.colors[idx] = color[0]
      buffers.colors[idx + 1] = color[1]
      buffers.colors[idx + 2] = color[2]

      buffers.sizes[visibleCount] = getCategorySize(sat.category)

      visibleCount++
    }

    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
    posAttr.needsUpdate = true

    const colorAttr = geometry.getAttribute('instanceColor') as THREE.BufferAttribute
    colorAttr.needsUpdate = true

    const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute
    sizeAttr.needsUpdate = true

    geometry.setDrawRange(0, visibleCount)

    spatialIndexRef.current.build(buffers.positions, visibleCount)
  })

  const { camera, raycaster } = useThree()

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!pointsRef.current) return

      const mouse = new THREE.Vector2()
      const rect = (event.nativeEvent.target as HTMLCanvasElement).getBoundingClientRect()

      mouse.x = ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const origin = raycaster.ray.origin
      const direction = raycaster.ray.direction
      const testPoint = origin
        .clone()
        .add(direction.clone().multiplyScalar(3))

      const nearestIdx = spatialIndexRef.current.findNearest(
        testPoint.x,
        testPoint.y,
        testPoint.z,
        0.1,
      )

      if (nearestIdx >= 0 && nearestIdx < filteredIndices.length) {
        const satIndex = filteredIndices[nearestIdx]
        selectSatellite(satellites[satIndex].id)
      }
    },
    [camera, raycaster, filteredIndices, satellites, selectSatellite],
  )

  const positionAttr = useMemo(
    () => new THREE.BufferAttribute(buffers.positions, 3),
    [buffers.positions],
  )
  const colorAttr = useMemo(
    () => new THREE.BufferAttribute(buffers.colors, 3),
    [buffers.colors],
  )
  const sizeAttr = useMemo(
    () => new THREE.BufferAttribute(buffers.sizes, 1),
    [buffers.sizes],
  )

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', positionAttr)
    geo.setAttribute('instanceColor', colorAttr)
    geo.setAttribute('size', sizeAttr)
    return geo
  }, [positionAttr, colorAttr, sizeAttr])

  return (
    <points
      ref={pointsRef}
      material={material}
      geometry={geometry}
      onClick={handleClick}
    />
  )
}
