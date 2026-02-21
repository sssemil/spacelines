import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gstime } from 'satellite.js'

const COASTLINE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_coastline.geojson'

const SURFACE_RADIUS = 1.002

type Coordinate = readonly [number, number]
type LineCoords = readonly Coordinate[]

type GeoJsonGeometry =
  | { readonly type: 'LineString'; readonly coordinates: LineCoords }
  | { readonly type: 'MultiLineString'; readonly coordinates: readonly LineCoords[] }

type GeoJsonFeature = {
  readonly type: 'Feature'
  readonly geometry: GeoJsonGeometry
}

type GeoJsonCollection = {
  readonly type: 'FeatureCollection'
  readonly features: readonly GeoJsonFeature[]
}

const geoToXYZ = (lon: number, lat: number): readonly [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = lon * (Math.PI / 180)
  return [
    SURFACE_RADIUS * Math.sin(phi) * Math.cos(theta),
    SURFACE_RADIUS * Math.cos(phi),
    SURFACE_RADIUS * Math.sin(phi) * Math.sin(theta),
  ]
}

const extractLines = (geometry: GeoJsonGeometry): readonly LineCoords[] => {
  if (geometry.type === 'LineString') return [geometry.coordinates]
  return geometry.coordinates
}

const buildGeometry = (data: GeoJsonCollection): THREE.BufferGeometry => {
  const vertices: number[] = []

  for (const feature of data.features) {
    const lines = extractLines(feature.geometry)
    for (const line of lines) {
      for (let i = 0; i < line.length - 1; i++) {
        const [ax, ay, az] = geoToXYZ(line[i][0], line[i][1])
        const [bx, by, bz] = geoToXYZ(line[i + 1][0], line[i + 1][1])
        vertices.push(ax, ay, az, bx, by, bz)
      }
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  return geo
}

export const EarthCoastlines = () => {
  const groupRef = useRef<THREE.Group>(null)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)

  useEffect(() => {
    fetch(COASTLINE_URL)
      .then((r) => r.json())
      .then((data: GeoJsonCollection) => setGeometry(buildGeometry(data)))
      .catch(() => {})
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = gstime(new Date())
  })

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x33ff33,
        transparent: true,
        opacity: 0.35,
      }),
    [],
  )

  if (!geometry) return null

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  )
}
