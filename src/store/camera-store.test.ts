import { describe, it, expect, beforeEach } from 'vitest'
import { useCameraStore } from './camera-store'

describe('camera store', () => {
  beforeEach(() => {
    useCameraStore.setState({
      target: null,
      isAnimating: false,
      sunTrackMode: true,
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
    expect(useCameraStore.getState().sunTrackMode).toBe(true)
  })

  it('should default sunTrackMode to true', () => {
    expect(useCameraStore.getState().sunTrackMode).toBe(true)
  })

  it('should disable sun tracking', () => {
    useCameraStore.getState().disableSunTrack()

    expect(useCameraStore.getState().sunTrackMode).toBe(false)
  })

  it('should enable sun tracking and clear target', () => {
    useCameraStore.getState().flyTo({ x: 1, y: 2, z: 3 })

    useCameraStore.getState().enableSunTrack()

    expect(useCameraStore.getState().sunTrackMode).toBe(true)
    expect(useCameraStore.getState().target).toBeNull()
    expect(useCameraStore.getState().isAnimating).toBe(false)
  })

  it('should disable sun tracking when flying to target', () => {
    useCameraStore.getState().flyTo({ x: 1, y: 2, z: 3 })

    expect(useCameraStore.getState().sunTrackMode).toBe(false)
  })
})
