import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useCameraStore } from '../../store/camera-store'
import { calculateSunDirection } from '../../orbital/sun-direction'

const ANIMATION_SPEED = 0.03
const SUN_TRACK_DISTANCE = 4

export const CameraController = () => {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const { camera, gl } = useThree()
  const target = useCameraStore((s) => s.target)
  const isAnimating = useCameraStore((s) => s.isAnimating)
  const onAnimationComplete = useCameraStore((s) => s.onAnimationComplete)
  const sunTrackMode = useCameraStore((s) => s.sunTrackMode)
  const disableSunTrack = useCameraStore((s) => s.disableSunTrack)

  const positionCameraToSun = useCallback(() => {
    const sunDir = calculateSunDirection(new Date())
    camera.position.set(
      sunDir.x * SUN_TRACK_DISTANCE,
      sunDir.y * SUN_TRACK_DISTANCE + 0.5,
      sunDir.z * SUN_TRACK_DISTANCE,
    )
    camera.up.set(0, 1, 0)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useEffect(() => {
    positionCameraToSun()
  }, [positionCameraToSun])

  useEffect(() => {
    if (!sunTrackMode) return

    const canvas = gl.domElement
    const handlePointerDown = () => disableSunTrack()
    canvas.addEventListener('pointerdown', handlePointerDown)
    return () => canvas.removeEventListener('pointerdown', handlePointerDown)
  }, [sunTrackMode, disableSunTrack, gl.domElement])

  useFrame(() => {
    if (sunTrackMode) {
      positionCameraToSun()
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
      return
    }

    if (!isAnimating || !target || !controlsRef.current) return

    const targetVec = new THREE.Vector3(target.x, target.y, target.z)
    const direction = targetVec.clone().normalize()
    const cameraTarget = direction.multiplyScalar(
      targetVec.length() + 0.5,
    )

    camera.position.lerp(cameraTarget, ANIMATION_SPEED)

    const distance = camera.position.distanceTo(cameraTarget)
    if (distance < 0.01) {
      onAnimationComplete()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!sunTrackMode}
      enablePan={false}
      minDistance={1.5}
      maxDistance={20}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  )
}
