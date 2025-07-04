import * as v from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { type Invite, inviteSchema } from "../invite/types/Invite.js";
import { inviteTargetSchema } from "../invite/types/InviteTarget.js";

export const createChannelInviteSchema = v.object({
  channel: snowflake,
  body: v.exactOptional(
    v.partial(
      v.object({
        /** duration of invite in seconds before expiry, or 0 for never. between 0 and 604800 (7 days) (default: 86400 (24 hours)) */
        maxAge: v.pipe(
          v.number(),
          v.integer(),
          v.minValue(0),
          v.maxValue(604800)
        ),
        /** max number of uses or 0 for unlimited. between 0 and 100 (default: 0) */
        maxUses: v.pipe(
          v.number(),
          v.integer(),
          v.minValue(0),
          v.maxValue(100)
        ),
        /** whether this invite only grants temporary membership (default: false) */
        temporary: v.boolean(),
        /** if true, don't try to reuse a similar invite (useful for creating many unique one time use invites) (default: false) */
        unique: v.boolean(),
        /** the type of target for this voice channel invite */
        targetType: inviteTargetSchema,
        /** the id of the user whose stream to display for this invite, required if target_type is 1, the user must be streaming in the channel	 */
        targetUserId: snowflake,
        /** the id of the embedded application to open for this invite, required if target_type is 2, the application must have the EMBEDDED flag	 */
        targetApplicationId: snowflake
      })
    )
  )
});

/**
 * ### [Create Channel Invite](https://discord.com/developers/docs/resources/channel#create-channel-invite)
 *
 * **POST** `/channels/:channel/invites`
 *
 * Create a new invite object for the channel. Only usable for guild channels. Requires the `CREATE_INSTANT_INVITE` permission. All JSON parameters for this route are optional, however the request body is not. If you are not sending any fields, you still have to send an empty JSON object (`{}`). Returns an {@link Invite | invite object}. Fires an Invite Create Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createChannelInvite: Fetcher<
  typeof createChannelInviteSchema,
  Invite
> = async ({ channel, body }) => post(`/channels/${channel}/invites`, body);

export const createChannelInviteSafe = toValidated(
  createChannelInvite,
  createChannelInviteSchema,
  inviteSchema
);

export const createChannelInviteProcedure = toProcedure(
  `mutation`,
  createChannelInvite,
  createChannelInviteSchema,
  inviteSchema
);
