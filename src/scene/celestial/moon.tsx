import { useRef, useMemo, useCallback, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { calculateMoonPosition, computeSplitMoonOrbitPath } from '../../orbital/moon-position'
import { EARTH_RADIUS_KM } from '../../orbital/transforms'
import { useCameraStore } from '../../store/camera-store'
import { useSatelliteStore } from '../../store/satellite-store'
import { useFilterStore } from '../../store/filter-store'
import { createMareOutline, MARIA } from './moon-maria'

const MOON_RADIUS_KM = 1737.4
const MOON_SCENE_RADIUS = MOON_RADIUS_KM / EARTH_RADIUS_KM
const WIRE_COLOR = 0x888888
const ORBIT_COLOR = '#888888'
const MARE_COLOR = '#666666'
const ORBIT_SEGMENTS = 200
const MARE_OUTLINE_POINTS = 32
const ORBIT_RECOMPUTE_FRAMES = 1800

const toVec3Array = (points: readonly { x: number; y: number; z: number }[]): THREE.Vector3[] =>
  points.map((p) => new THREE.Vector3(p.x, p.y, p.z))

export const Moon = () => {
  const groupRef = useRef<THREE.Group>(null)
  const frameCountRef = useRef(0)
  const flyTo = useCameraStore((s) => s.flyTo)
  const clearSelection = useSatelliteStore((s) => s.clearSelection)
  const showMoon = useFilterStore((s) => s.showMoon)
  const [orbitTick, setOrbitTick] = useState(0)

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

  const splitPath = useMemo(() => {
    return computeSplitMoonOrbitPath({ date: new Date(), segments: ORBIT_SEGMENTS })
  }, [orbitTick])

  const pastPoints = useMemo(() => toVec3Array(splitPath.past), [splitPath])
  const futurePoints = useMemo(() => toVec3Array(splitPath.future), [splitPath])

  const mariaOutlines = useMemo(() => {
    return MARIA.map((mare) =>
      toVec3Array(
        createMareOutline({
          ...mare,
          numPoints: MARE_OUTLINE_POINTS,
          sphereRadius: MOON_SCENE_RADIUS * 1.002,
        }),
      ),
    )
  }, [])

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation()
      if (!groupRef.current) return

      const { x, y, z } = groupRef.current.position
      clearSelection()
      flyTo({ x, y, z }, { centerOnTarget: true })
    },
    [flyTo, clearSelection],
  )

  useFrame(() => {
    if (!groupRef.current) return

    frameCountRef.current++
    if (frameCountRef.current % ORBIT_RECOMPUTE_FRAMES === 0) {
      setOrbitTick((t) => t + 1)
    }

    const pos = calculateMoonPosition(new Date())
    groupRef.current.position.set(pos.x, pos.y, pos.z)
    groupRef.current.lookAt(0, 0, 0)
  })

  if (!showMoon) return null

  return (
    <group>
      <group ref={groupRef}>
        <mesh material={wireMaterial} onClick={handleClick}>
          <sphereGeometry args={[MOON_SCENE_RADIUS, 16, 12]} />
        </mesh>

        {mariaOutlines.map((outline, i) => (
          <Line
            key={i}
            points={outline}
            color={MARE_COLOR}
            lineWidth={1}
            transparent
            opacity={0.5}
          />
        ))}
      </group>

      {pastPoints.length > 1 && (
        <Line
          points={pastPoints}
          color={ORBIT_COLOR}
          lineWidth={1.5}
          transparent
          opacity={0.7}
        />
      )}

      {futurePoints.length > 1 && (
        <Line
          points={futurePoints}
          color={ORBIT_COLOR}
          lineWidth={1.5}
          transparent
          opacity={0.4}
          dashed
          dashSize={1}
          gapSize={0.6}
        />
      )}
    </group>
  )
}
