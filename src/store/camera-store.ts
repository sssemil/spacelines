import { create } from 'zustand'
import type { ScenePosition } from '../types/satellite'

type CameraState = {
  readonly target: ScenePosition | null
  readonly isAnimating: boolean
  readonly sunTrackMode: boolean
  readonly flyTo: (target: ScenePosition) => void
  readonly onAnimationComplete: () => void
  readonly reset: () => void
  readonly enableSunTrack: () => void
  readonly disableSunTrack: () => void
}

export const useCameraStore = create<CameraState>((set) => ({
  target: null,
  isAnimating: false,
  sunTrackMode: true,
  flyTo: (target) => set({ target, isAnimating: true, sunTrackMode: false }),
  onAnimationComplete: () => set({ isAnimating: false }),
  reset: () => set({ target: null, isAnimating: false, sunTrackMode: true }),
  enableSunTrack: () => set({ sunTrackMode: true, target: null, isAnimating: false }),
  disableSunTrack: () => set({ sunTrackMode: false }),
}))
