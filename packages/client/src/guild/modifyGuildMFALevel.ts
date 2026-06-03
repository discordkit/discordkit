import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { mfaLevelSchema, type MFALevel } from "./types/MFALevel.js";

export const modifyGuildMFALevelSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** MFA level */
    level: mfaLevelSchema
  })
});

/**
 * ### Modify Guild MFA Level
 *
 * **POST** `/guilds/:guild/mfa`
 *
 * Modify a guild's MFA level. Requires guild ownership. Returns the updated {@link MFALevel | level} on success. Fires a Guild Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * @deprecated Discord removed this endpoint from the public docs. Calls
 * may still succeed against the live API but the behavior is unsupported
 * and may be removed at any time. This export will be deleted in a future
 * major release.
 */
export const modifyGuildMFALevel: Fetcher<
  typeof modifyGuildMFALevelSchema,
  MFALevel,
  { auditLogReason: true }
> = async ({ guild, body }, options) =>
  post(`/guilds/${guild}/mfa`, body, options);
