import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";
import { type InviteMetadata } from "../invite/types/InviteMetadata.js";

export const getGuildInvitesSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Invites](https://discord.com/developers/docs/resources/guild#get-guild-invites)
 *
 * **GET** `/guilds/:guild/invites`
 *
 * Returns a list of {@link InviteMetadata | invite objects}. Requires the `MANAGE_GUILD` or `VIEW_AUDIT_LOG` permission. Invite Metadata is included with the `MANAGE_GUILD` permission.
 */
export const getGuildInvites: Fetcher<
  typeof getGuildInvitesSchema,
  InviteMetadata[]
> = async ({ guild }) => get(`/guilds/${guild}/invites`);
