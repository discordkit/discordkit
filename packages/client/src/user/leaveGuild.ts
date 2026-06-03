import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const leaveGuildSchema = v.object({
  guild: snowflake
});

/**
 * ### [Leave Guild](https://discord.com/developers/docs/resources/user#leave-guild)
 *
 * **DELETE** `/users/@me/guilds/:guild`
 *
 * Leave a guild. Returns a 204 empty response on success. Fires a Guild Delete Gateway event and a Guild Member Remove Gateway event.
 */
export const leaveGuild: Fetcher<typeof leaveGuildSchema> = async ({ guild }) =>
  remove(`/users/@me/guilds/${guild}`);
