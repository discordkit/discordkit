import { z } from "zod";
import type { Invite } from "../invite";
import { get, query } from "../utils";

export const getGuildVanityURLSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a partial invite object for guilds with that feature enabled. Requires the `MANAGE_GUILD` permission. `code` will be null if a vanity url for the guild is not set.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-vanity-url
 */
export const getGuildVanityURL = query(
  getGuildVanityURLSchema,
  async ({ input: { guild } }) =>
    get<Partial<Invite>>(`/guilds/${guild}/vanity-url`)
);
