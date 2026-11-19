import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ComputedPermissions } from "../permissions/ComputedPermissions.js";

export const getChannelMemberPermissionsSchema = v.object({
  channel: snowflake,
  user: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** whether to apply [implicit permission masking](https://discord.com/developers/docs/topics/permissions#implicit-permissions) for missing `VIEW_CHANNEL` or voice/stage `CONNECT`. Not applied when the target member is a bot. Defaults to `true` */
        implicit: v.boolean()
      })
    )
  )
});

/**
 * ### [Get Channel Member Permissions](https://discord.com/developers/docs/resources/channel#get-channel-member-permissions)
 *
 * **GET** `/channels/:channel/permissions/member/:user`
 *
 * Returns the member's {@link ComputedPermissions | computed permissions} in the channel, including their roles and member-specific overwrites. Threads use their parent channel's overwrites. Requires the `VIEW_CHANNEL` permission, and additionally `CONNECT` for voice and stage channels.
 */
export const getChannelMemberPermissions: Fetcher<
  typeof getChannelMemberPermissionsSchema,
  ComputedPermissions
> = async ({ channel, user, params }) =>
  get(`/channels/${channel}/permissions/member/${user}`, params);
