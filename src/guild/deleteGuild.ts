import { z } from "zod";
import { mutation, remove } from "../utils";

export const deleteGuildSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Delete a guild permanently. User must be owner. Returns `204 No Content` on success. Fires a [Guild Delete](https://discord.com/developers/docs/topics/gateway#guild-delete) Gateway event.
 *
 * https://discord.com/developers/docs/resources/guild#delete-guild
 */
export const deleteGuild = mutation(deleteGuildSchema, async ({ guild }) => remove(`/guilds/${guild}`));
