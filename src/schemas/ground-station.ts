import { z } from 'zod'

export const GroundStationSchema = z.object({
  id: z.number(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  altitude: z.number(),
  status: z.string(),
})

export type GroundStation = z.infer<typeof GroundStationSchema>

export const GroundStationResponseSchema = z.array(GroundStationSchema)

export type GroundStationResponse = z.infer<typeof GroundStationResponseSchema>
