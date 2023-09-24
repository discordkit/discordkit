import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { memberSchema, type Member } from "./types/Member";

export const modifyGuildMemberSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  body: z.object({
    /** value to set user's nickname to	(Requires `MANAGE_NICKNAMES` permission) */
    nick: z.string().min(1).optional(),
    /** array of role ids the member is assigned (Requires `MANAGE_ROLES` permission) */
    roles: z.string().min(1).array().optional(),
    /** whether the user is muted in voice channels (Requires `MUTE_MEMBERS` permission) */
    mute: z.boolean().optional(),
    /** whether the user is deafened in voice channels (Requires `DEAFEN_MEMBERS` permission) */
    deaf: z.boolean().optional(),
    /** id of channel to move user to (if they are connected to voice) (Requires `MOVE_MEMBERS` permission) */
    channelId: z.string().min(1).optional(),
    /** when the user's timeout will expire and the user will be able to communicate in the guild again (up to 28 days in the future), set to null to remove timeout. Will throw a 403 error if the user has the `ADMINISTRATOR` permission or is the owner of the guild (Requires `MODERATE_MEMBERS` permission) */
    communicationDisabledUntil: z.string().min(1).nullable()
  })
});

/**
 * Modify attributes of a guild member. Returns a `200 OK` with the guild member as the body. Fires a [Guild Member Update](https://discord.com/developers/docs/topics/gateway#guild-member-update) Gateway event. If the `channel_id` is set to null, this will force the target user to be disconnected from voice.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-member
 */
export const modifyGuildMember: Fetcher<
  typeof modifyGuildMemberSchema,
  Member
> = async ({ guild, user, body }) =>
  patch(`/guilds/${guild}/members/${user}`, body);

export const modifyGuildMemberProcedure = toProcedure(
  `mutation`,
  modifyGuildMember,
  modifyGuildMemberSchema,
  memberSchema
);
