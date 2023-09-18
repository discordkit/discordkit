import { z } from "zod";
import { post, type Fetcher } from "../utils";
import { InviteTarget, type Invite } from "../invite";

export const createChannelInviteSchema = z.object({
  channel: z.string().min(1),
  body: z.object({
    /** duration of invite in seconds before expiry, or 0 for never. between 0 and 604800 (7 days) (default: 86400 (24 hours)) */
    maxAge: z.number().min(0).max(604800),
    /** max number of uses or 0 for unlimited. between 0 and 100 (default: 0) */
    maxUses: z.number().min(0).max(100),
    /** whether this invite only grants temporary membership (default: false) */
    temporary: z.boolean(),
    /** if true, don't try to reuse a similar invite (useful for creating many unique one time use invites) (default: false) */
    unique: z.boolean(),
    /** the type of target for this voice channel invite */
    targetType: z.nativeEnum(InviteTarget),
    /** the id of the user whose stream to display for this invite, required if target_type is 1, the user must be streaming in the channel	 */
    targetUserId: z.string().min(1),
    /** the id of the embedded application to open for this invite, required if target_type is 2, the application must have the EMBEDDED flag	 */
    targetApplicationId: z.string().min(1)
  })
});

/**
 * Create a new invite object for the channel. Only usable for guild channels. Requires the `CREATE_INSTANT_INVITE` permission. All JSON parameters for this route are optional, however the request body is not. If you are not sending any fields, you still have to send an empty JSON object (`{}`). Returns an invite object. Fires an [Invite Create](https://discord.com/developers/docs/topics/gateway#invite-create) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#create-channel-invite
 */
export const createChannelInvite: Fetcher<
  typeof createChannelInviteSchema,
  Invite
> = async ({ channel, body }) => post(`/channels/${channel}/invites`, body);
