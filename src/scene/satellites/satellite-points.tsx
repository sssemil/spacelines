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
const UPDATE_EVERY_N_FRAMES = 15

export const SatellitePoints = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const spatialIndexRef = useRef(new SpatialIndex(0.5))
  const frameRef = useRef(0)
  const visibleCountRef = useRef(0)

  const satellites = useSatelliteStore((s) => s.satellites)
  const selectedId = useSatelliteStore((s) => s.selectedId)
  const selectSatellite = useSatelliteStore((s) => s.selectSatellite)
  const activeCategories = useFilterStore((s) => s.activeCategories)

  const material = useMemo(() => createPointMaterial(), [])

  const buffers = useMemo(() => ({
    positions: new Float32Array(MAX_SATELLITES * 3),
    colors: new Float32Array(MAX_SATELLITES * 3),
    sizes: new Float32Array(MAX_SATELLITES),
  }), [])

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

    frameRef.current++
    const isFirstFrame = frameRef.current <= 2
    const shouldUpdate = isFirstFrame || frameRef.current % UPDATE_EVERY_N_FRAMES === 0

    if (!shouldUpdate) return

    const geometry = pointsRef.current.geometry
    const now = new Date()
    const hasSelection = selectedId !== null
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
      const dim = hasSelection ? 0.15 : 1
      buffers.colors[idx] = color[0] * dim
      buffers.colors[idx + 1] = color[1] * dim
      buffers.colors[idx + 2] = color[2] * dim

      buffers.sizes[visibleCount] = getCategorySize(sat.category)
      visibleCount++
    }

    visibleCountRef.current = visibleCount

    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
    posAttr.needsUpdate = true

    const colorAttr = geometry.getAttribute('instanceColor') as THREE.BufferAttribute
    colorAttr.needsUpdate = true

    const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute
    sizeAttr.needsUpdate = true

    geometry.setDrawRange(0, visibleCount)
    spatialIndexRef.current.build(buffers.positions, visibleCount)
  })

  const { camera } = useThree()

  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const pointerDownRef = useRef({ x: 0, y: 0 })

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    pointerDownRef.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
  }, [])

  const DRAG_THRESHOLD = 5

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      const dx = event.nativeEvent.clientX - pointerDownRef.current.x
      const dy = event.nativeEvent.clientY - pointerDownRef.current.y
      if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) return

      const rect = (event.nativeEvent.target as HTMLCanvasElement).getBoundingClientRect()
      mouseRef.current.set(
        ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1,
      )

      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const origin = raycasterRef.current.ray.origin
      const dir = raycasterRef.current.ray.direction

      let bestIdx = -1
      let bestAngle = 0.03

      for (let d = 0.3; d < 12.0; d += 0.3) {
        const idx = spatialIndexRef.current.findNearest(
          origin.x + dir.x * d,
          origin.y + dir.y * d,
          origin.z + dir.z * d,
          0.5,
        )
        if (idx < 0) continue

        const sx = buffers.positions[idx * 3] - origin.x
        const sy = buffers.positions[idx * 3 + 1] - origin.y
        const sz = buffers.positions[idx * 3 + 2] - origin.z
        const t = sx * dir.x + sy * dir.y + sz * dir.z
        if (t < 0.1) continue
        const cx = origin.x + dir.x * t - buffers.positions[idx * 3]
        const cy = origin.y + dir.y * t - buffers.positions[idx * 3 + 1]
        const cz = origin.z + dir.z * t - buffers.positions[idx * 3 + 2]
        const angle = Math.sqrt(cx * cx + cy * cy + cz * cz) / t

        if (angle < bestAngle) {
          bestAngle = angle
          bestIdx = idx
        }
      }

      if (bestIdx >= 0 && bestIdx < filteredIndices.length) {
        const satIndex = filteredIndices[bestIdx]
        selectSatellite(satellites[satIndex].id)
      }
    },
    [camera, buffers.positions, filteredIndices, satellites, selectSatellite],
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

  const hitMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
    [],
  )

  return (
    <group>
      <points
        ref={pointsRef}
        material={material}
        geometry={geometry}
      />
      <mesh
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        material={hitMaterial}
      >
        <sphereGeometry args={[15, 8, 8]} />
      </mesh>
    </group>
  )
}
