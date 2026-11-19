import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ComputedPermissions } from "../permissions/ComputedPermissions.js";

export const getChannelRolePermissionsSchema = v.object({
  channel: snowflake,
  role: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** whether to apply [implicit permission masking](https://discord.com/developers/docs/topics/permissions#implicit-permissions) for missing `VIEW_CHANNEL` or voice/stage `CONNECT`. Defaults to `true` */
        implicit: v.boolean()
      })
    )
  )
});

/**
 * ### [Get Channel Role Permissions](https://discord.com/developers/docs/resources/channel#get-channel-role-permissions)
 *
 * **GET** `/channels/:channel/permissions/role/:role`
 *
 * Returns the {@link ComputedPermissions | permissions} granted by the specified role together with `@everyone`, applying their channel overwrites. Other roles and member-specific overwrites are not included. Threads use their parent channel's overwrites. Requires the `VIEW_CHANNEL` permission, and additionally `CONNECT` for voice and stage channels.
 */
export const getChannelRolePermissions: Fetcher<
  typeof getChannelRolePermissionsSchema,
  ComputedPermissions
> = async ({ channel, role, params }) =>
  get(`/channels/${channel}/permissions/role/${role}`, params);
