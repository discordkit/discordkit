import { z } from "zod";
import { put, type Fetcher } from "../utils";
import type { Member } from "./types";

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
 * Adds a user to the guild, provided you have a valid oauth2 access token for the user with the `guilds.join` scope. Returns a 201 Created with the guild member as the body, or 204 No Content if the user is already a member of the guild. Fires a [Guild Member Add](https://discord.com/developers/docs/topics/gateway#guild-member-add) Gateway event.
 *
 * For guilds with [Membership Screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) enabled, this endpoint will default to adding new members as `pending` in the guild member object. Members that are `pending` will have to complete membership screening before they become full members that can talk.
 *
 * *The Authorization header must be a Bot token (belonging to the same application used for authorization), and the bot must be a member of the guild with `CREATE_INSTANT_INVITE` permission.*
 *
 * For guilds with Membership Screening enabled, assigning a role using the `roles` parameter will add the user to the guild as a full member (`pending` is false in the member object). A member with a role will bypass membership screening and the guild's verification level, and get immediate access to chat. Therefore, instead of assigning a role when the member joins, it is recommended to grant roles only after the user completes screening.
 *
 * https://discord.com/developers/docs/resources/guild#add-guild-member
 */
export const addGuildMember: Fetcher<
  typeof addGuildMemberSchema,
  Member
> = async ({ guild, user, body }) =>
  put(`/guilds/${guild}/members/${user}`, body);
