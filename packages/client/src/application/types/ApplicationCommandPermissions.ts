import { z } from "zod";
import { applicationCommandPermissionType } from "./ApplicationCommandPermissionType.ts";

export const applicationCommandPermissionsSchema = z.object({
  /** ID of the role, user, or channel. It can also be a permission constant */
  id: z.string().min(1),
  /** role (1), user (2), or channel (3) */
  type: applicationCommandPermissionType,
  /** true to allow, false, to disallow */
  permission: z.boolean()
});

export type ApplicationCommandPermissions = z.infer<
  typeof applicationCommandPermissionsSchema
>;
