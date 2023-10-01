import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  inviteMetadataSchema,
  type InviteMetadata
} from "#/invite/types/InviteMetadata.ts";

export const getGuildInvitesSchema = z.object({
  guild: snowflake
});

/**
 * ### [Get Guild Invites](https://discord.com/developers/docs/resources/guild#get-guild-invites)
 *
 * **GET** `/guilds/:guild/invites`
 *
 * Returns a list of {@link InviteMetadata | invite objects} (with invite metadata) for the guild. Requires the `MANAGE_GUILD` permission.
 */
export const getGuildInvites: Fetcher<
  typeof getGuildInvitesSchema,
  InviteMetadata[]
> = async ({ guild }) => get(`/guilds/${guild}/invites`);

export const getGuildInvitesSafe = toValidated(
  getGuildInvites,
  getGuildInvitesSchema,
  inviteMetadataSchema.array()
);

export const getGuildInvitesProcedure = toProcedure(
  `query`,
  getGuildInvites,
  getGuildInvitesSchema,
  inviteMetadataSchema.array()
);

export const getGuildInvitesQuery = toQuery(getGuildInvites);
