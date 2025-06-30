import type { InferOutput } from "valibot";
import { isoTimestamp, nullable, nullish, object, pipe, string } from "valibot";

export const incidentsDataSchema = object({
  /** when invites get enabled again */
  invitesDisabledUntil: nullable(pipe(string(), isoTimestamp())),
  /** when direct messages get enabled again */
  dmsDisabledUntil: nullable(pipe(string(), isoTimestamp())),
  /** when the dm spam was detected */
  dmSpamDetectedAt: nullish(pipe(string(), isoTimestamp())),
  /** when the raid was detected */
  raidDetectedAt: nullish(pipe(string(), isoTimestamp()))
});

export type IncidentsData = InferOutput<typeof incidentsDataSchema>;
