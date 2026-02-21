import { describe, it, expect, beforeEach } from 'vitest'
import { useCameraStore } from './camera-store'

describe('camera store', () => {
  beforeEach(() => {
    useCameraStore.setState({
      target: null,
      isAnimating: false,
    })
  })

  it('should start with no target', () => {
    expect(useCameraStore.getState().target).toBeNull()
  })

  it('should set a fly-to target', () => {
    const target = { x: 1, y: 2, z: 3 }

    useCameraStore.getState().flyTo(target)

    expect(useCameraStore.getState().target).toEqual(target)
    expect(useCameraStore.getState().isAnimating).toBe(true)
  })

  it('should clear target when animation completes', () => {
    useCameraStore.getState().flyTo({ x: 1, y: 2, z: 3 })

    useCameraStore.getState().onAnimationComplete()

    expect(useCameraStore.getState().isAnimating).toBe(false)
  })

  it('should reset camera to default', () => {
    useCameraStore.getState().flyTo({ x: 1, y: 2, z: 3 })

    useCameraStore.getState().reset()

    expect(useCameraStore.getState().target).toBeNull()
    expect(useCameraStore.getState().isAnimating).toBe(false)
  })
})
