import { create } from 'zustand'
import type { ScenePosition } from '../types/satellite'

type CameraState = {
  readonly target: ScenePosition | null
  readonly isAnimating: boolean
  readonly flyTo: (target: ScenePosition) => void
  readonly onAnimationComplete: () => void
  readonly reset: () => void
}

export const useCameraStore = create<CameraState>((set) => ({
  target: null,
  isAnimating: false,
  flyTo: (target) => set({ target, isAnimating: true }),
  onAnimationComplete: () => set({ isAnimating: false }),
  reset: () => set({ target: null, isAnimating: false }),
}))
