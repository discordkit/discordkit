import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const modifyGuildChannelPositionsSchema = v.object({
  guild: snowflake,
  body: v.array(
    v.object({
      /** channel id */
      id: snowflake,
      /** sorting position of the channel */
      position: v.nullish(v.pipe(v.number(), v.integer(), v.minValue(0))),
      /** syncs the permission overwrites with the new parent, if moving to a new category */
      lockPermissions: v.nullish(v.boolean()),
      /** the new parent ID for the channel that is moved */
      parentId: v.nullish(snowflake)
    })
  )
});

/**
 * ### [Modify Guild Channel Positions](https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions)
 *
 * **PATCH** `/guilds/:guild/channels`
 *
 * Modify the positions of a set of channel objects for the guild. Requires `MANAGE_CHANNELS` permission. Returns a 204 empty response on success. Fires multiple Channel Update Gateway events.
 *
 * This endpoint takes a JSON array of parameters in the following format:
 *
 * > [!NOTE]
 * >
 * > Only channels to be modified are required.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * > [!NOTE]
 * >
 * > At most one entry per request may change `parentId`. A request that changes `parentId` for more than one channel fails with a `400` response and error code `40009` (`Only one channel can have a parent_id modified at a time`).
 *
 * > [!NOTE]
 * >
 * > Permissions are checked per entry, based on what the entry changes:
 * >
 * > - An entry that only changes `position` requires the `MANAGE_CHANNELS` permission at the guild level (or on the channel's current parent category). It does **not** require access to the individual channel, so a full reordering may include channels the current user cannot view.
 * > - An entry that changes `parentId` requires the `MANAGE_CHANNELS` permission on that channel and on the destination (the new parent category, or the guild when moving the channel out of a category).
 */
export const modifyGuildChannelPositions: Fetcher<
  typeof modifyGuildChannelPositionsSchema,
  void,
  { auditLogReason: true }
> = async ({ guild, body }, options) =>
  patch(`/guilds/${guild}/channels`, body, options);
