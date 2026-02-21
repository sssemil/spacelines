import { OmmResponseSchema } from '../schemas/omm'
import type { OmmResponse } from '../schemas/omm'
import { CELESTRAK_BASE_URL, SATELLITE_GROUPS } from './groups'

type FetchResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string }

export const fetchSatelliteGroup = async (
  groupId: string,
): Promise<FetchResult<OmmResponse>> => {
  const group = SATELLITE_GROUPS.find((g) => g.id === groupId)
  if (!group) {
    return { success: false, error: `Unknown group: ${groupId}` }
  }

  try {
    const response = await fetch(
      `${CELESTRAK_BASE_URL}?${group.query}&FORMAT=json`,
    )

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const json: unknown = await response.json()
    const parsed = OmmResponseSchema.safeParse(json)

    if (!parsed.success) {
      return { success: false, error: 'Invalid API response format' }
    }

    return { success: true, data: parsed.data }
  } catch {
    return { success: false, error: 'Network error' }
  }
}
