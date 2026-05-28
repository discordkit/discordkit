import * as v from "valibot";
import { patch, type Fetcher, snowflake } from "@discordkit/core";

export const modifyCurrentUserNickSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** value to set user's nickname to (requires `CHANGE_NICKNAME` permission) */
    nick: v.nullish(v.pipe(v.string(), v.nonEmpty()))
  })
});

/**
 * ### [Modify Current User Nick](https://discord.com/developers/docs/resources/guild#modify-current-user-nick)
 *
 * **PATCH** `/guilds/:guild/members/@me/nick`
 *
 * Modifies the nickname of the current user in a guild. Returns a `200` with the nickname on success. Fires a Guild Member Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * @deprecated Discord has deprecated this endpoint in favor of
 * {@link modifyCurrentMember | Modify Current Member}, which returns
 * the full updated {@link Member | member object} instead of just the
 * nickname value. New consumers should use that instead.
 */
export const modifyCurrentUserNick: Fetcher<
  typeof modifyCurrentUserNickSchema,
  { nick: string | null }
> = async ({ guild, body }) =>
  patch(`/guilds/${guild}/members/@me/nick`, body);
