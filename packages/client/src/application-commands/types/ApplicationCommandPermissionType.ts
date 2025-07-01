import * as v from "valibot";

export const ApplicationCommandPermissionType = {
  ROLE: 1,
  USER: 2,
  CHANNEL: 3
} as const;

export const applicationCommandPermissionTypeSchema = v.enum_(
  ApplicationCommandPermissionType
);
