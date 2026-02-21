import type { SatRec } from 'satellite.js'

export type SatelliteCategory =
  | 'station'
  | 'starlink'
  | 'oneweb'
  | 'gps'
  | 'glonass'
  | 'galileo'
  | 'beidou'
  | 'weather'
  | 'earth-observation'
  | 'communications'
  | 'debris'
  | 'rocket-body'
  | 'unknown'

export type Satellite = {
  readonly id: number
  readonly name: string
  readonly intlDesignator: string
  readonly category: SatelliteCategory
  readonly satrec: SatRec
  readonly epochDate: Date
}

export type EciPosition = {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type ScenePosition = {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type GeodeticPosition = {
  readonly latitude: number
  readonly longitude: number
  readonly altitude: number
}

export type SatellitePosition = {
  readonly eci: EciPosition
  readonly scene: ScenePosition
  readonly geodetic: GeodeticPosition
  readonly velocity: number
}
