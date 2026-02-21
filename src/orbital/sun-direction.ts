import { jday, sunPos } from 'satellite.js'
import type { ScenePosition } from '../types/satellite'

export const calculateSunDirection = (date: Date): ScenePosition => {
  const julianDay = jday(date)
  const { rtasc, decl } = sunPos(julianDay)

  return {
    x: Math.cos(decl) * Math.cos(rtasc),
    y: Math.sin(decl),
    z: -Math.cos(decl) * Math.sin(rtasc),
  }
}
