import { z } from "zod";
import { mutation, post } from "../utils";
import { mfaLevel, type MFALevel } from "./types";

export const modifyGuildMFALevelSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** MFA level */
    level: mfaLevel
  })
});

/**
 * Modify a guild's MFA level. Requires guild ownership. Returns the updated level on success. Fires a [Guild Update](https://discord.com/developers/docs/topics/gateway#guild-update) Gateway event.
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level
 */
export const modifyGuildMFALevel = mutation(
  modifyGuildMFALevelSchema,
  async ({ guild, body }) => post<MFALevel>(`/guilds/${guild}/mfa`, body)
);
