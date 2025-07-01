import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asInteger
} from "@discordkit/core";
import { memberSchema, type Member } from "./types/Member.js";
import { guildMemberFlag } from "./types/GuildMemberFlags.js";

export const modifyGuildMemberSchema = v.object({
  guild: snowflake,
  user: snowflake,
  body: v.partial(
    v.object({
      /** value to set user's nickname to	(Requires `MANAGE_NICKNAMES` permission) */
      nick: v.nullish(v.pipe(v.string(), v.nonEmpty())),
      /** array of role ids the member is assigned (Requires `MANAGE_ROLES` permission) */
      roles: v.nullish(v.array(snowflake)),
      /** whether the user is muted in voice channels (Requires `MUTE_MEMBERS` permission) */
      mute: v.nullish(v.boolean()),
      /** whether the user is deafened in voice channels (Requires `DEAFEN_MEMBERS` permission) */
      deaf: v.nullish(v.boolean()),
      /** id of channel to move user to (if they are connected to voice) (Requires `MOVE_MEMBERS` permission) */
      channelId: v.nullish(snowflake),
      /** when the user's timeout will expire and the user will be able to communicate in the guild again (up to 28 days in the future), set to null to remove timeout. Will throw a 403 error if the user has the `ADMINISTRATOR` permission or is the owner of the guild (Requires `MODERATE_MEMBERS` permission) */
      communicationDisabledUntil: v.nullish(
        v.pipe(v.string(), v.isoTimestamp())
      ),
      /** guild member flags */
      flags: v.nullish(asInteger(guildMemberFlag) as v.GenericSchema<number>)
    })
  )
});

/**
 * ### [Modify Guild Member](https://discord.com/developers/docs/resources/guild#modify-guild-member)
 *
 * **PATCH** `/guilds/:guild/members/:user`
 *
 * Modify attributes of a guild member. Returns a `200 OK` with the {@link Member | guild member} as the body. Fires a Guild Member Update Gateway event. If the `channelId` is set to null, this will force the target user to be disconnected from voice.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional and nullable. When moving members to channels, the API user must have permissions to both connect to the channel and have the `MOVE_MEMBERS` permission.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildMember: Fetcher<
  typeof modifyGuildMemberSchema,
  Member
> = async ({ guild, user, body }) =>
  patch(`/guilds/${guild}/members/${user}`, body);

export const modifyGuildMemberSafe = toValidated(
  modifyGuildMember,
  modifyGuildMemberSchema,
  memberSchema
);

export const modifyGuildMemberProcedure = toProcedure(
  `mutation`,
  modifyGuildMember,
  modifyGuildMemberSchema,
  memberSchema
);
