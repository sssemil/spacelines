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
  const centerOnTarget = useCameraStore((s) => s.centerOnTarget)
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

  useEffect(() => {
    if (!isAnimating) return

    const canvas = gl.domElement
    const handlePointerDown = () => onAnimationComplete()
    canvas.addEventListener('pointerdown', handlePointerDown)
    return () => canvas.removeEventListener('pointerdown', handlePointerDown)
  }, [isAnimating, onAnimationComplete, gl.domElement])

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

    if (centerOnTarget) {
      const direction = targetVec.clone().normalize()
      const cameraGoal = direction.multiplyScalar(targetVec.length() - 1.5)

      controlsRef.current.target.lerp(targetVec, ANIMATION_SPEED)
      camera.position.lerp(cameraGoal, ANIMATION_SPEED)
      controlsRef.current.update()
    } else {
      const direction = targetVec.clone().normalize()
      const cameraGoal = direction.multiplyScalar(targetVec.length() + 0.5)

      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), ANIMATION_SPEED)
      camera.position.lerp(cameraGoal, ANIMATION_SPEED)
      controlsRef.current.update()
    }

    const goalDist = centerOnTarget ? targetVec.length() - 1.5 : targetVec.length() + 0.5
    const goalVec = targetVec.clone().normalize().multiplyScalar(goalDist)
    if (camera.position.distanceTo(goalVec) < 0.01) {
      onAnimationComplete()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!sunTrackMode}
      enablePan={false}
      minDistance={1.5}
      maxDistance={75}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  )
}
