import * as v from "valibot";

export const incidentsDataSchema = v.object({
  /** when invites get enabled again */
  invitesDisabledUntil: v.nullable<v.GenericSchema<string>>(
    v.pipe(v.string(), v.isoTimestamp())
  ),
  /** when direct messages get enabled again */
  dmsDisabledUntil: v.nullable<v.GenericSchema<string>>(
    v.pipe(v.string(), v.isoTimestamp())
  ),
  /** when the dm spam was detected */
  dmSpamDetectedAt: v.nullish<v.GenericSchema<string>>(
    v.pipe(v.string(), v.isoTimestamp())
  ),
  /** when the raid was detected */
  raidDetectedAt: v.nullish<v.GenericSchema<string>>(
    v.pipe(v.string(), v.isoTimestamp())
  )
});

export interface IncidentsData
  extends v.InferOutput<typeof incidentsDataSchema> {}
