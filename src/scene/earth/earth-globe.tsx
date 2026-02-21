import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform vec3 cameraPosition;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, 3.0);

    vec3 atmosphereColor = mix(
      vec3(0.1, 0.4, 1.0),
      vec3(0.3, 0.7, 1.0),
      fresnel
    );

    gl_FragColor = vec4(atmosphereColor, fresnel * 0.6);
  }
`

export const EarthGlobe = () => {
  const cloudRef = useRef<THREE.Mesh>(null)

  const earthMaterial = useMemo(() => {
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x1a3a5c),
      emissive: new THREE.Color(0x0a1628),
      specular: new THREE.Color(0x111111),
      shininess: 10,
    })
    return mat
  }, [])

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  )

  useFrame(() => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0001
    }
  })

  return (
    <group>
      <mesh material={earthMaterial}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.005, 64, 64]} />
        <meshPhongMaterial
          color={0xffffff}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[1.12, 64, 64]} />
      </mesh>

      <GridLines />
    </group>
  )
}

const GridLines = () => {
  const gridMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x1a4a7a,
        transparent: true,
        opacity: 0.15,
      }),
    [],
  )

  const latLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = []
    for (let lat = -60; lat <= 60; lat += 30) {
      const geometry = new THREE.BufferGeometry()
      const points: THREE.Vector3[] = []
      const r = Math.cos((lat * Math.PI) / 180) * 1.002
      const y = Math.sin((lat * Math.PI) / 180) * 1.002

      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2
        points.push(new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle)))
      }
      geometry.setFromPoints(points)
      lines.push(geometry)
    }
    return lines
  }, [])

  const lonLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = []
    for (let lon = 0; lon < 360; lon += 30) {
      const geometry = new THREE.BufferGeometry()
      const points: THREE.Vector3[] = []

      for (let i = 0; i <= 64; i++) {
        const lat = (i / 64) * Math.PI - Math.PI / 2
        const r = 1.002
        points.push(
          new THREE.Vector3(
            r * Math.cos(lat) * Math.cos((lon * Math.PI) / 180),
            r * Math.sin(lat),
            r * Math.cos(lat) * Math.sin((lon * Math.PI) / 180),
          ),
        )
      }
      geometry.setFromPoints(points)
      lines.push(geometry)
    }
    return lines
  }, [])

  const lineObjects = useMemo(() => {
    const objects: THREE.Line[] = []
    for (const geo of latLines) {
      objects.push(new THREE.LineLoop(geo, gridMaterial))
    }
    for (const geo of lonLines) {
      objects.push(new THREE.Line(geo, gridMaterial))
    }
    return objects
  }, [latLines, lonLines, gridMaterial])

  return (
    <group>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  )
}
