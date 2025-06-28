import { enum_ } from "valibot";

export const ApplicationCommandPermissionType = {
  ROLE: 1,
  USER: 2,
  CHANNEL: 3
} as const;

export const applicationCommandPermissionTypeSchema = enum_(
  ApplicationCommandPermissionType
);
