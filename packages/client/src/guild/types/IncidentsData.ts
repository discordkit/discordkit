import { timestamp } from "@discordkit/core/validations/timestamp";
import * as v from "valibot";

/**
 * ### [Incidents Data](https://discord.com/developers/docs/resources/guild#incidents-data-object)
 */
export const incidentsDataSchema = v.object({
  /** when invites get enabled again */
  invitesDisabledUntil: v.nullable(timestamp),
  /** when direct messages get enabled again */
  dmsDisabledUntil: v.nullable(timestamp),
  /** when the dm spam was detected */
  dmSpamDetectedAt: v.nullish(timestamp),
  /** when the raid was detected */
  raidDetectedAt: v.nullish(timestamp)
});

export interface IncidentsData extends v.InferOutput<
  typeof incidentsDataSchema
> {}
