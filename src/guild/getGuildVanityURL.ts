import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { inviteSchema, type Invite } from "../invite/types/Invite";

export const getGuildVanityURLSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns a partial invite object for guilds with that feature enabled. Requires the `MANAGE_GUILD` permission. `code` will be null if a vanity url for the guild is not set.
 *
 * https://discord.com/developers/docs/resources/guild#get-guild-vanity-url
 */
export const getGuildVanityURL: Fetcher<
  typeof getGuildVanityURLSchema,
  Partial<Invite>
> = async ({ guild }) => get(`/guilds/${guild}/vanity-url`);

export const getGuildVanityURLProcedure = toProcedure(
  `query`,
  getGuildVanityURL,
  getGuildVanityURLSchema,
  inviteSchema.partial()
);

export const getGuildVanityURLQuery = toQuery(getGuildVanityURL);
