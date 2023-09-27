import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const leaveGuildSchema = z.object({
  guild: z.string().min(1)
});

/**
 * ### [Leave Guild](https://discord.com/developers/docs/resources/user#leave-guild)
 *
 * **DELETE** `/users/@me/guilds/:guild`
 *
 * Leave a guild. Returns a `204 empty` response on success. Fires a Guild Delete Gateway event and a Guild Member Remove Gateway event.
 */
export const leaveGuild: Fetcher<typeof leaveGuildSchema> = async ({ guild }) =>
  remove(`/users/@me/guilds/${guild}`);

export const leaveGuildProcedure = toProcedure(
  `mutation`,
  leaveGuild,
  leaveGuildSchema
);
