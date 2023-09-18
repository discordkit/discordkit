import { z } from "zod";
import { remove, type Fetcher } from "../utils";

export const leaveGuildSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Leave a guild. Returns a `204 empty` response on success.
 *
 * https://discord.com/developers/docs/resources/user#leave-guild
 */
export const leaveGuild: Fetcher<typeof leaveGuildSchema> = async ({ guild }) =>
  remove(`/users/@me/guilds/${guild}`);
