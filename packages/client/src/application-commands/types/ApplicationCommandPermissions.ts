import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { applicationCommandPermissionTypeSchema } from "./ApplicationCommandPermissionType.js";

/**
 * ### [Application Command Permissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object)
 */
export const applicationCommandPermissionsSchema = v.object({
  /** ID of the role, user, or channel. It can also be a permission constant */
  id: snowflake,
  /** role (1), user (2), or channel (3) */
  type: applicationCommandPermissionTypeSchema,
  /** true to allow, false, to disallow */
  permission: v.boolean()
});

export interface ApplicationCommandPermissions extends v.InferOutput<
  typeof applicationCommandPermissionsSchema
> {}
