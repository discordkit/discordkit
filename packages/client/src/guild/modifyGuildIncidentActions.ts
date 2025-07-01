import * as v from "valibot";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type IncidentsData,
  incidentsDataSchema
} from "./types/IncidentsData.js";

export const modifyGuildIncidentActionsSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** when invites will be enabled again */
    invitesDisabledUntil: v.nullish(v.pipe(v.string(), v.isoTimestamp())),
    /** when direct messages will be enabled again */
    dmsDisabledUntil: v.nullish(v.pipe(v.string(), v.isoTimestamp()))
  })
});

/**
 * ### [Modify Guild Incident Actions](https://discord.com/developers/docs/resources/guild#modify-guild-incident-actions)
 *
 * **PUT** `/guilds/:guild/incident-actions`
 *
 * Modifies the incident actions of the guild. Returns a 200 with the Incidents Data object for the guild. Requires the `MANAGE_GUILD` permission.
 *
 * > [!NOTE]
 * >
 * > Both `invitesDisabledUntil` and `dmsDisabledUntil` can be enabled for a maximal timespan of 24 hours in the future.
 */
export const modifyGuildIncidentActions: Fetcher<
  typeof modifyGuildIncidentActionsSchema,
  IncidentsData
> = async ({ guild, body }) => put(`/guilds/${guild}/incident-actions`, body);

export const modifyGuildIncidentActionsSafe = toValidated(
  modifyGuildIncidentActions,
  modifyGuildIncidentActionsSchema,
  incidentsDataSchema
);

export const modifyGuildIncidentActionsProcedure = toProcedure(
  `mutation`,
  modifyGuildIncidentActions,
  modifyGuildIncidentActionsSchema,
  incidentsDataSchema
);
