import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { mfaLevelSchema, type MFALevel } from "./types/MFALevel";

export const modifyGuildMFALevelSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** MFA level */
    level: mfaLevelSchema
  })
});

/**
 * Modify a guild's MFA level. Requires guild ownership. Returns the updated level on success. Fires a [Guild Update](https://discord.com/developers/docs/topics/gateway#guild-update) Gateway event.
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level
 */
export const modifyGuildMFALevel: Fetcher<
  typeof modifyGuildMFALevelSchema,
  MFALevel
> = async ({ guild, body }) => patch(`/guilds/${guild}/mfa`, body);

export const modifyGuildMFALevelProcedure = toProcedure(
  `mutation`,
  modifyGuildMFALevel,
  modifyGuildMFALevelSchema,
  mfaLevelSchema
);
