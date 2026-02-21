import { z } from 'zod'

export const OmmRecordSchema = z.object({
  OBJECT_NAME: z.string(),
  OBJECT_ID: z.string(),
  EPOCH: z.string(),
  MEAN_MOTION: z.number(),
  ECCENTRICITY: z.number(),
  INCLINATION: z.number(),
  RA_OF_ASC_NODE: z.number(),
  ARG_OF_PERICENTER: z.number(),
  MEAN_ANOMALY: z.number(),
  EPHEMERIS_TYPE: z.number(),
  CLASSIFICATION_TYPE: z.string(),
  NORAD_CAT_ID: z.number(),
  ELEMENT_SET_NO: z.number(),
  REV_AT_EPOCH: z.number(),
  BSTAR: z.number(),
  MEAN_MOTION_DOT: z.number(),
  MEAN_MOTION_DDOT: z.number(),
})

export type OmmRecord = z.infer<typeof OmmRecordSchema>

export const OmmResponseSchema = z.array(OmmRecordSchema)

export type OmmResponse = z.infer<typeof OmmResponseSchema>
