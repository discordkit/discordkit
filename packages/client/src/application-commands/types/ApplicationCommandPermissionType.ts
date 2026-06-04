import * as v from "valibot";

export const ApplicationCommandPermissionType = {
  ROLE: 1,
  USER: 2,
  CHANNEL: 3
} as const;

/**
 * ### [Application Command Permission Type](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object)
 */
export const applicationCommandPermissionTypeSchema = v.enum_(
  ApplicationCommandPermissionType
);
