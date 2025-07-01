import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { inviteSchema, type Invite } from "../invite/types/Invite.js";

export const getGuildVanityURLSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Vanity URL](https://discord.com/developers/docs/resources/guild#get-guild-vanity-url)
 *
 * **GET** `/guilds/:guild/vanity-url`
 *
 * Returns a partial {@link Invite | invite object} for guilds with that feature enabled. Requires the `MANAGE_GUILD` permission. code will be `null` if a vanity url for the guild is not set.
 */
export const getGuildVanityURL: Fetcher<
  typeof getGuildVanityURLSchema,
  Partial<Invite>
> = async ({ guild }) => get(`/guilds/${guild}/vanity-url`);

export const getGuildVanityURLSafe = toValidated(
  getGuildVanityURL,
  getGuildVanityURLSchema,
  v.partial(inviteSchema)
);

export const getGuildVanityURLProcedure = toProcedure(
  `query`,
  getGuildVanityURL,
  getGuildVanityURLSchema,
  v.partial(inviteSchema)
);

export const getGuildVanityURLQuery = toQuery(getGuildVanityURL);
