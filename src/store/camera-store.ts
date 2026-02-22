import { create } from 'zustand'
import type { ScenePosition } from '../types/satellite'

type FlyToOptions = {
  readonly centerOnTarget?: boolean
}

type CameraState = {
  readonly target: ScenePosition | null
  readonly isAnimating: boolean
  readonly sunTrackMode: boolean
  readonly centerOnTarget: boolean
  readonly flyTo: (target: ScenePosition, options?: FlyToOptions) => void
  readonly onAnimationComplete: () => void
  readonly reset: () => void
  readonly enableSunTrack: () => void
  readonly disableSunTrack: () => void
}

export const useCameraStore = create<CameraState>((set) => ({
  target: null,
  isAnimating: false,
  sunTrackMode: true,
  centerOnTarget: false,
  flyTo: (target, options) => set({
    target,
    isAnimating: true,
    sunTrackMode: false,
    centerOnTarget: options?.centerOnTarget ?? false,
  }),
  onAnimationComplete: () => set({ isAnimating: false }),
  reset: () => set({ target: null, isAnimating: false, sunTrackMode: true, centerOnTarget: false }),
  enableSunTrack: () => set({ sunTrackMode: true, target: null, isAnimating: false, centerOnTarget: false }),
  disableSunTrack: () => set({ sunTrackMode: false }),
}))
