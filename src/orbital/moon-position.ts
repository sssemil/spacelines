import { jday } from 'satellite.js'
import { EARTH_RADIUS_KM } from './transforms'

export type MoonPosition = {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly distanceKm: number
}

const DEG_TO_RAD = Math.PI / 180
const MEAN_DISTANCE_KM = 385001
const J2000_EPOCH_JD = 2451545.0
const DAYS_PER_CENTURY = 36525

const normalizeAngle = (degrees: number): number => {
  const result = degrees % 360
  return result < 0 ? result + 360 : result
}

const julianCenturiesFromJ2000 = (date: Date): number => {
  const jd = jday(date)
  return (jd - J2000_EPOCH_JD) / DAYS_PER_CENTURY
}

const calculateFundamentalArguments = (T: number) => {
  const Lp = normalizeAngle(218.3165 + 481267.8813 * T)
  const D = normalizeAngle(297.8502 + 445267.1115 * T)
  const M = normalizeAngle(357.5291 + 35999.0503 * T)
  const Mp = normalizeAngle(134.9634 + 477198.8676 * T)
  const F = normalizeAngle(93.272 + 483202.0175 * T)

  return {
    Lp: Lp * DEG_TO_RAD,
    D: D * DEG_TO_RAD,
    M: M * DEG_TO_RAD,
    Mp: Mp * DEG_TO_RAD,
    F: F * DEG_TO_RAD,
  }
}

const calculateEclipticLongitude = (args: ReturnType<typeof calculateFundamentalArguments>): number => {
  const { Lp, D, M, Mp, F } = args

  const longitudeCorrection =
    6.289 * Math.sin(Mp) +
    1.274 * Math.sin(2 * D - Mp) +
    0.658 * Math.sin(2 * D) +
    0.214 * Math.sin(2 * Mp) +
    -0.186 * Math.sin(M) +
    -0.114 * Math.sin(2 * F)

  return Lp + longitudeCorrection * DEG_TO_RAD
}

const calculateEclipticLatitude = (args: ReturnType<typeof calculateFundamentalArguments>): number => {
  const { D, Mp, F } = args

  const latitudeCorrection =
    5.128 * Math.sin(F) +
    0.281 * Math.sin(Mp + F) +
    0.278 * Math.sin(Mp - F) +
    0.173 * Math.sin(2 * D - F) +
    0.055 * Math.sin(2 * D - Mp - F) +
    0.046 * Math.sin(2 * D - Mp + F)

  return latitudeCorrection * DEG_TO_RAD
}

const calculateDistanceKm = (args: ReturnType<typeof calculateFundamentalArguments>): number => {
  const { D, M, Mp } = args

  const distanceCorrection =
    -20905 * Math.cos(Mp) +
    -3699 * Math.cos(2 * D - Mp) +
    -2956 * Math.cos(2 * D) +
    -570 * Math.cos(2 * Mp) +
    246 * Math.cos(M)

  return MEAN_DISTANCE_KM + distanceCorrection
}

const eclipticToEquatorial = (
  longitude: number,
  latitude: number,
  T: number,
): { ra: number; dec: number } => {
  const obliquity = (23.4393 - 0.013 * T) * DEG_TO_RAD

  const sinLon = Math.sin(longitude)
  const cosLon = Math.cos(longitude)
  const sinLat = Math.sin(latitude)
  const cosLat = Math.cos(latitude)
  const sinObl = Math.sin(obliquity)
  const cosObl = Math.cos(obliquity)

  const ra = Math.atan2(sinLon * cosObl - (sinLat / cosLat) * sinObl, cosLon)
  const dec = Math.asin(sinLat * cosObl + cosLat * sinObl * sinLon)

  return { ra, dec }
}

import type { ScenePosition } from '../types/satellite'

const SIDEREAL_MONTH_MS = 27.322 * 24 * 60 * 60 * 1000

type ComputeMoonOrbitPathOptions = {
  readonly date: Date
  readonly segments: number
}

type SplitMoonOrbitPath = {
  readonly past: readonly ScenePosition[]
  readonly future: readonly ScenePosition[]
}

export const computeSplitMoonOrbitPath = ({
  date,
  segments,
}: ComputeMoonOrbitPathOptions): SplitMoonOrbitPath => {
  const halfPeriodMs = SIDEREAL_MONTH_MS / 2
  const now = date.getTime()
  const halfSegments = Math.floor(segments / 2)

  const nowPos = calculateMoonPosition(new Date(now))
  const nowScene: ScenePosition = { x: nowPos.x, y: nowPos.y, z: nowPos.z }

  const past: ScenePosition[] = []
  for (let i = 0; i < halfSegments; i++) {
    const t = now - halfPeriodMs + (i / halfSegments) * halfPeriodMs
    const pos = calculateMoonPosition(new Date(t))
    past.push({ x: pos.x, y: pos.y, z: pos.z })
  }
  past.push(nowScene)

  const future: ScenePosition[] = [nowScene]
  for (let i = 1; i < halfSegments; i++) {
    const t = now + (i / halfSegments) * halfPeriodMs
    const pos = calculateMoonPosition(new Date(t))
    future.push({ x: pos.x, y: pos.y, z: pos.z })
  }

  return { past, future }
}

export const calculateMoonPosition = (date: Date): MoonPosition => {
  const T = julianCenturiesFromJ2000(date)
  const args = calculateFundamentalArguments(T)

  const eclipticLon = calculateEclipticLongitude(args)
  const eclipticLat = calculateEclipticLatitude(args)
  const distanceKm = calculateDistanceKm(args)

  const { ra, dec } = eclipticToEquatorial(eclipticLon, eclipticLat, T)

  const sceneDistance = distanceKm / EARTH_RADIUS_KM

  return {
    x: Math.cos(dec) * Math.cos(ra) * sceneDistance,
    y: Math.sin(dec) * sceneDistance,
    z: -Math.cos(dec) * Math.sin(ra) * sceneDistance,
    distanceKm,
  }
}
