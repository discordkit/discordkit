import * as v from "valibot";
import { asDigits } from "@discordkit/core/validations/asDigits";
import { schema } from "@discordkit/core/validations/schema";
import { permissionFlag } from "./Permissions.js";

const _computedPermissionsSchema = v.object({
  /** the computed {@link Permissions | permissions} as a stringified bitfield */
  permissions: asDigits(permissionFlag)
});

export interface ComputedPermissions extends v.InferOutput<
  typeof _computedPermissionsSchema
> {}

/**
 * ### [Permissions Response](https://discord.com/developers/docs/resources/guild#get-guild-member-permissions-permissions-response)
 *
 * The permissions Discord computed for a member or a role, either across a guild or in one of its channels.
 */
export const computedPermissionsSchema = schema<ComputedPermissions>(
  _computedPermissionsSchema
);
