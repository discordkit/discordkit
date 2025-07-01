import { object, boolean, type InferOutput } from "valibot";
import { snowflake } from "@discordkit/core";
import { applicationCommandPermissionTypeSchema } from "./ApplicationCommandPermissionType.js";

export const applicationCommandPermissionsSchema = object({
  /** ID of the role, user, or channel. It can also be a permission constant */
  id: snowflake,
  /** role (1), user (2), or channel (3) */
  type: applicationCommandPermissionTypeSchema,
  /** true to allow, false, to disallow */
  permission: boolean()
});

export interface ApplicationCommandPermissions
  extends InferOutput<typeof applicationCommandPermissionsSchema> {}
