import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { gstime } from 'satellite.js'
import { GroundStationResponseSchema, type GroundStation } from '../../schemas/ground-station'
import { useFilterStore } from '../../store/filter-store'
import { useGroundStationStore } from '../../store/ground-station-store'

const SATNOGS_STATIONS_URL = `https://corsproxy.io/?url=${encodeURIComponent('https://network.satnogs.org/api/stations/?format=json')}`
const STATION_RADIUS = 1.003
const HIT_SPHERE_RADIUS = 1.05
const CLICK_DISTANCE_THRESHOLD = 0.08

export const geoToScenePosition = (lon: number, lat: number): readonly [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = -lon * (Math.PI / 180)
  return [
    STATION_RADIUS * Math.sin(phi) * Math.cos(theta),
    STATION_RADIUS * Math.cos(phi),
    STATION_RADIUS * Math.sin(phi) * Math.sin(theta),
  ]
}

const isOnline = (station: GroundStation): boolean => station.status === 'Online'

const buildPointsGeometry = (stations: readonly GroundStation[]): THREE.BufferGeometry => {
  const positions = new Float32Array(stations.length * 3)

  stations.forEach((station, i) => {
    const [x, y, z] = geoToScenePosition(station.lng, station.lat)
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

const findNearestStation = (
  localPoint: THREE.Vector3,
  stations: readonly GroundStation[],
): GroundStation | undefined => {
  let nearest: GroundStation | undefined
  let minDist = CLICK_DISTANCE_THRESHOLD

  stations.forEach((station) => {
    const [x, y, z] = geoToScenePosition(station.lng, station.lat)
    const dx = localPoint.x - x
    const dy = localPoint.y - y
    const dz = localPoint.z - z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (dist < minDist) {
      minDist = dist
      nearest = station
    }
  })

  return nearest
}

export const GroundStations = () => {
  const groupRef = useRef<THREE.Group>(null)
  const stationsRef = useRef<readonly GroundStation[]>([])
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const showGroundStations = useFilterStore((s) => s.showGroundStations)
  const selectStation = useGroundStationStore((s) => s.selectStation)

  useEffect(() => {
    fetch(SATNOGS_STATIONS_URL)
      .then((r) => r.json())
      .then((data: unknown) => {
        const parsed = GroundStationResponseSchema.safeParse(data)
        if (!parsed.success) return
        const onlineStations = parsed.data.filter(isOnline)
        if (onlineStations.length > 0) {
          stationsRef.current = onlineStations
          useGroundStationStore.getState().setStations(onlineStations)
          setGeometry(buildPointsGeometry(onlineStations))
        }
      })
      .catch(() => {})
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = gstime(new Date())
  })

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!groupRef.current) return
      event.stopPropagation()

      const localPoint = groupRef.current.worldToLocal(event.point.clone())
      const nearest = findNearestStation(localPoint, stationsRef.current)

      if (nearest) {
        selectStation(nearest.id)
      }
    },
    [selectStation],
  )

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0x4488ff,
        size: 3,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.8,
      }),
    [],
  )

  const hitMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        visible: false,
      }),
    [],
  )

  if (!geometry || !showGroundStations) return null

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
      <mesh material={hitMaterial} onClick={handleClick}>
        <sphereGeometry args={[HIT_SPHERE_RADIUS, 32, 16]} />
      </mesh>
    </group>
  )
}
