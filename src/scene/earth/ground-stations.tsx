import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gstime } from 'satellite.js'
import { GroundStationResponseSchema, type GroundStation } from '../../schemas/ground-station'
import { useFilterStore } from '../../store/filter-store'

const SATNOGS_STATIONS_URL = '/api/satnogs/api/stations/?format=json'
const STATION_RADIUS = 1.003

const geoToXYZ = (lon: number, lat: number): readonly [number, number, number] => {
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
    const [x, y, z] = geoToXYZ(station.lng, station.lat)
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

export const GroundStations = () => {
  const groupRef = useRef<THREE.Group>(null)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const showGroundStations = useFilterStore((s) => s.showGroundStations)

  useEffect(() => {
    fetch(SATNOGS_STATIONS_URL)
      .then((r) => r.json())
      .then((data: unknown) => {
        const parsed = GroundStationResponseSchema.safeParse(data)
        if (!parsed.success) return
        const onlineStations = parsed.data.filter(isOnline)
        if (onlineStations.length > 0) {
          setGeometry(buildPointsGeometry(onlineStations))
        }
      })
      .catch(() => {})
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = gstime(new Date())
  })

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

  if (!geometry || !showGroundStations) return null

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
    </group>
  )
}
