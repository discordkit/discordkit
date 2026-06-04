import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteGuildSchema = v.object({
  guild: snowflake
});

/**
 * ### Delete Guild
 *
 * **DELETE** `/guilds/:guild`
 *
 * Delete a guild permanently. User must be owner. Returns `204 No Content` on success. Fires a Guild Delete Gateway event.
 *
 * @deprecated Discord removed this endpoint from the public docs. Calls
 * may still succeed against the live API but the behavior is unsupported
 * and may be removed at any time. This export will be deleted in a future
 * major release.
 */
export const deleteGuild: Fetcher<typeof deleteGuildSchema> = async ({
  guild
}) => remove(`/guilds/${guild}`);
