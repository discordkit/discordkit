import { enum_ } from "valibot";

/** Where an app can be installed, also called its supported installation contexts. */
export const ApplicationIntegrationTypes = {
  /** App is installable to servers */
  GUILD_INSTALL: 0,
  /** App is installable to users */
  USER_INSTALL: 1
} as const;

export const applicationIntegrationTypesSchema = enum_(
  ApplicationIntegrationTypes
);
