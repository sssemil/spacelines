import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useCameraStore } from '../../store/camera-store'

const ANIMATION_SPEED = 0.03
const DEFAULT_DISTANCE = 4

export const CameraController = () => {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const { camera } = useThree()
  const target = useCameraStore((s) => s.target)
  const isAnimating = useCameraStore((s) => s.isAnimating)
  const onAnimationComplete = useCameraStore((s) => s.onAnimationComplete)

  useEffect(() => {
    camera.position.set(0, 1.5, DEFAULT_DISTANCE)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame(() => {
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
      enablePan={false}
      minDistance={1.5}
      maxDistance={20}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  )
}
