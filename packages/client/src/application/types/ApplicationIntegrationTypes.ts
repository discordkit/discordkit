import * as v from "valibot";

/** Where an app can be installed, also called its supported installation contexts. */
export const ApplicationIntegrationTypes = {
  /** App is installable to servers */
  GUILD_INSTALL: 0,
  /** App is installable to users */
  USER_INSTALL: 1
} as const;

/**
 * ### [Application Integration Types](https://discord.com/developers/docs/resources/application#application-object-application-integration-types)
 */
export const applicationIntegrationTypesSchema = v.enum_(
  ApplicationIntegrationTypes
);
