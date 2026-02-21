import type { EciPosition, ScenePosition } from '../types/satellite'

export const EARTH_RADIUS_KM = 6371
export const SCENE_SCALE = 1 / EARTH_RADIUS_KM

export const eciToScene = (eci: EciPosition): ScenePosition => ({
  x: eci.x * SCENE_SCALE,
  y: eci.z * SCENE_SCALE,
  z: -eci.y * SCENE_SCALE,
})
