import { useEffect, useCallback } from 'react'
import { twoline2satrec } from 'satellite.js'
import { useSatelliteStore } from '../store/satellite-store'
import { OmmResponseSchema } from '../schemas/omm'
import type { OmmRecord } from '../schemas/omm'
import type { Satellite } from '../types/satellite'
import { classifySatellite } from '../utils/classifier'
import { CELESTRAK_BASE_URL } from '../api/groups'

const ommToSatellite = (record: OmmRecord): Satellite | null => {
  const line1 = buildTleLine1(record)
  const line2 = buildTleLine2(record)

  try {
    const satrec = twoline2satrec(line1, line2)
    return {
      id: record.NORAD_CAT_ID,
      name: record.OBJECT_NAME,
      intlDesignator: record.OBJECT_ID,
      category: classifySatellite(record.OBJECT_NAME),
      satrec,
      epochDate: new Date(record.EPOCH),
    }
  } catch {
    return null
  }
}

const padNumber = (n: number, width: number): string =>
  String(n).padStart(width, '0')

const formatExponent = (value: number): string => {
  if (value === 0) return ' 00000-0'
  const sign = value < 0 ? '-' : ' '
  const abs = Math.abs(value)
  const exp = Math.floor(Math.log10(abs))
  const mantissa = abs / Math.pow(10, exp)
  const mantissaStr = Math.round(mantissa * 100000).toString().padStart(5, '0')
  const expStr = (exp + 1).toString()
  return `${sign}${mantissaStr}${value < 0 ? '-' : '+'}${expStr}`
}

const buildTleLine1 = (record: OmmRecord): string => {
  const epoch = computeTleEpoch(new Date(record.EPOCH))
  const noradId = padNumber(record.NORAD_CAT_ID, 5)
  const classification = record.CLASSIFICATION_TYPE || 'U'
  const intlDesig = (record.OBJECT_ID || '').padEnd(8)
  const meanMotionDot = record.MEAN_MOTION_DOT >= 0
    ? ` .${Math.abs(record.MEAN_MOTION_DOT).toFixed(8).split('.')[1]}`
    : `-.${Math.abs(record.MEAN_MOTION_DOT).toFixed(8).split('.')[1]}`
  const meanMotionDdot = formatExponent(record.MEAN_MOTION_DDOT)
  const bstar = formatExponent(record.BSTAR)
  const ephType = record.EPHEMERIS_TYPE
  const elementSetNo = padNumber(record.ELEMENT_SET_NO, 4)

  const line = `1 ${noradId}${classification} ${intlDesig} ${epoch} ${meanMotionDot} ${meanMotionDdot} ${bstar} ${ephType} ${elementSetNo}`
  return line.padEnd(68) + checksumTle(line.padEnd(68))
}

const buildTleLine2 = (record: OmmRecord): string => {
  const noradId = padNumber(record.NORAD_CAT_ID, 5)
  const inclination = record.INCLINATION.toFixed(4).padStart(8)
  const raan = record.RA_OF_ASC_NODE.toFixed(4).padStart(8)
  const eccentricity = record.ECCENTRICITY.toFixed(7).split('.')[1]
  const argPerigee = record.ARG_OF_PERICENTER.toFixed(4).padStart(8)
  const meanAnomaly = record.MEAN_ANOMALY.toFixed(4).padStart(8)
  const meanMotion = record.MEAN_MOTION.toFixed(8).padStart(11)
  const revAtEpoch = padNumber(record.REV_AT_EPOCH, 5)

  const line = `2 ${noradId} ${inclination} ${raan} ${eccentricity} ${argPerigee} ${meanAnomaly} ${meanMotion}${revAtEpoch}`
  return line.padEnd(68) + checksumTle(line.padEnd(68))
}

const computeTleEpoch = (date: Date): string => {
  const year = date.getUTCFullYear() % 100
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const dayOfYear =
    (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000) + 1
  return `${padNumber(year, 2)}${dayOfYear.toFixed(8).padStart(12, ' ')}`
}

const checksumTle = (line: string): string => {
  let sum = 0
  for (let i = 0; i < 68; i++) {
    const ch = line[i]
    if (ch >= '0' && ch <= '9') sum += parseInt(ch)
    else if (ch === '-') sum += 1
  }
  return String(sum % 10)
}

const FETCH_GROUPS = [
  'GROUP=stations',
  'GROUP=active',
  'GROUP=starlink',
]

export const useSatelliteData = (): void => {
  const { setSatellites, setLoading, setError } = useSatelliteStore()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const allSatellites = new Map<number, Satellite>()

      const results = await Promise.allSettled(
        FETCH_GROUPS.map(async (group) => {
          const response = await fetch(
            `${CELESTRAK_BASE_URL}?${group}&FORMAT=json`,
          )
          if (!response.ok) return []
          const json: unknown = await response.json()
          const parsed = OmmResponseSchema.safeParse(json)
          return parsed.success ? parsed.data : []
        }),
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          for (const record of result.value) {
            if (!allSatellites.has(record.NORAD_CAT_ID)) {
              const sat = ommToSatellite(record)
              if (sat) {
                allSatellites.set(sat.id, sat)
              }
            }
          }
        }
      }

      setSatellites([...allSatellites.values()])
    } catch {
      setError('Failed to load satellite data')
    } finally {
      setLoading(false)
    }
  }, [setSatellites, setLoading, setError])

  useEffect(() => {
    loadData()
  }, [loadData])
}
