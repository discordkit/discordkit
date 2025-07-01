import type { GenericSchema, InferOutput } from "valibot";
import { isoTimestamp, nullable, nullish, object, pipe, string } from "valibot";

export const incidentsDataSchema = object({
  /** when invites get enabled again */
  invitesDisabledUntil: nullable<GenericSchema<string>>(
    pipe(string(), isoTimestamp())
  ),
  /** when direct messages get enabled again */
  dmsDisabledUntil: nullable<GenericSchema<string>>(
    pipe(string(), isoTimestamp())
  ),
  /** when the dm spam was detected */
  dmSpamDetectedAt: nullish<GenericSchema<string>>(
    pipe(string(), isoTimestamp())
  ),
  /** when the raid was detected */
  raidDetectedAt: nullish<GenericSchema<string>>(pipe(string(), isoTimestamp()))
});

export interface IncidentsData
  extends InferOutput<typeof incidentsDataSchema> {}
