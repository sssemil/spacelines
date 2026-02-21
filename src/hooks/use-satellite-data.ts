import { useEffect, useCallback } from 'react'
import { twoline2satrec } from 'satellite.js'
import { useSatelliteStore } from '../store/satellite-store'
import type { Satellite } from '../types/satellite'
import { classifySatellite } from '../utils/classifier'
import { CELESTRAK_BASE_URL } from '../api/groups'

type TleRecord = {
  readonly name: string
  readonly line1: string
  readonly line2: string
}

const parse3le = (text: string): readonly TleRecord[] => {
  const lines = text.trim().split('\n').map((l) => l.trim())
  const records: TleRecord[] = []

  let i = 0
  while (i < lines.length - 2) {
    if (lines[i + 1]?.startsWith('1 ') && lines[i + 2]?.startsWith('2 ')) {
      records.push({
        name: lines[i],
        line1: lines[i + 1],
        line2: lines[i + 2],
      })
      i += 3
    } else if (lines[i]?.startsWith('1 ') && lines[i + 1]?.startsWith('2 ')) {
      records.push({
        name: 'UNKNOWN',
        line1: lines[i],
        line2: lines[i + 1],
      })
      i += 2
    } else {
      i += 1
    }
  }

  return records
}

const tleToSatellite = (record: TleRecord): Satellite | null => {
  try {
    const satrec = twoline2satrec(record.line1, record.line2)
    const noradId = parseInt(record.line1.substring(2, 7).trim(), 10)
    const intlDesig = record.line1.substring(9, 17).trim()

    return {
      id: noradId,
      name: record.name,
      intlDesignator: intlDesig,
      category: classifySatellite(record.name),
      satrec,
      epochDate: new Date(),
    }
  } catch {
    return null
  }
}

const FETCH_GROUPS = [
  'GROUP=stations',
  'GROUP=active',
  'GROUP=starlink',
  'GROUP=oneweb',
  'GROUP=gps-ops',
  'GROUP=glo-ops',
  'GROUP=galileo',
  'GROUP=beidou',
  'GROUP=weather',
  'GROUP=resource',
  'GROUP=science',
  'GROUP=geodetic',
  'GROUP=engineering',
  'GROUP=education',
  'GROUP=military',
  'GROUP=radar',
  'GROUP=other-comm',
  'GROUP=satnogs',
  'GROUP=x-comm',
  'GROUP=gnss',
  'GROUP=amateur',
  'GROUP=last-30-days',
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
            `${CELESTRAK_BASE_URL}?${group}&FORMAT=3le`,
          )
          if (!response.ok) return []
          const text = await response.text()
          return parse3le(text)
        }),
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          for (const record of result.value) {
            const sat = tleToSatellite(record)
            if (sat && !allSatellites.has(sat.id)) {
              allSatellites.set(sat.id, sat)
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
