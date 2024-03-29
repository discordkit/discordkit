import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { applicationCommandPermissionType } from "./ApplicationCommandPermissionType.js";

export const applicationCommandPermissionsSchema = z.object({
  /** ID of the role, user, or channel. It can also be a permission constant */
  id: snowflake,
  /** role (1), user (2), or channel (3) */
  type: applicationCommandPermissionType,
  /** true to allow, false, to disallow */
  permission: z.boolean()
});

export type ApplicationCommandPermissions = z.infer<
  typeof applicationCommandPermissionsSchema
>;
