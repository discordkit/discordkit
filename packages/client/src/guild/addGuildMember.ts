import { z } from "zod";
import { put, type Fetcher, toProcedure, toValidated } from "@discordkit/core";
import { memberSchema, type Member } from "./types/Member.ts";

export const addGuildMemberSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  body: z.object({
    /** an oauth2 access token granted with the `guilds.join` to the bot's application for the user you want to add to the guild */
    accessToken: z.string().min(1),
    /** value to set user's nickname to	(Requires `MANAGE_NICKNAMES` permission) */
    nick: z.string().min(1).optional(),
    /** array of role ids the member is assigned (Requires `MANAGE_ROLES` permission) */
    roles: z.array(z.string().min(1)).optional(),
    /** whether the user is muted in voice channels (Requires `MUTE_MEMBERS` permission) */
    mute: z.boolean().optional(),
    /** whether the user is deafened in voice channels (Requires `DEAFEN_MEMBERS` permission) */
    deaf: z.boolean().optional()
  })
});

/**
 * ### [Add Guild Member](https://discord.com/developers/docs/resources/guild#add-guild-member)
 *
 * **PUT** `/guilds/:guild/members/:user`
 *
 * Adds a user to the guild, provided you have a valid oauth2 access token for the user with the `guilds.join` scope. Returns a `201 Created` with the {@link Member | guild member} as the body, or `204 No Content` if the user is already a member of the guild. Fires a Guild Member Add Gateway event.
 *
 * For guilds with Membership Screening enabled, this endpoint will default to adding new members as `pending` in the guild member object. Members that are `pending` will have to complete membership screening before they become full members that can talk.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint except for `accessToken` are optional.
 *
 * > **NOTE**
 * >
 * > The Authorization header must be a Bot token (belonging to the same application used for authorization), and the bot must be a member of the guild with `CREATE_INSTANT_INVITE` permission.
 */
export const addGuildMember: Fetcher<
  typeof addGuildMemberSchema,
  Member
> = async ({ guild, user, body }) =>
  put(`/guilds/${guild}/members/${user}`, body);

export const addGuildMemberSafe = toValidated(
  addGuildMember,
  addGuildMemberSchema,
  memberSchema
);

export const addGuildMemberProcedure = toProcedure(
  `mutation`,
  addGuildMember,
  addGuildMemberSchema,
  memberSchema
);
