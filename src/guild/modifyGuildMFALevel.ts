import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "#/utils/index.ts";
import { mfaLevelSchema, type MFALevel } from "./types/MFALevel.ts";

export const modifyGuildMFALevelSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** MFA level */
    level: mfaLevelSchema
  })
});

/**
 * ### [Modify Guild MFA Level](https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level)
 *
 * **POST** `/guilds/:guild/mfa`
 *
 * Modify a guild's MFA level. Requires guild ownership. Returns the updated {@link MFALevel | level} on success. Fires a Guild Update Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
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
