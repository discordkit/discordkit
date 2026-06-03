import * as v from "valibot";
import { snowflake } from "@discordkit/core/validations/snowflake";

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

/**
 * ### [Authorizing Integration Owners](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object)
 *
 * Wire shape of the `authorizing_integration_owners` field on an
 * Interaction.
 *
 * Discord sends this as a JSON object keyed by the *stringified*
 * values of {@link ApplicationIntegrationTypes} — `"0"` for
 * `GUILD_INSTALL` and `"1"` for `USER_INSTALL`. Each key appears
 * independently based on whether its installation context applies to
 * the interaction, so both keys are optional.
 *
 * Per Discord docs:
 * - `"0"` (GUILD_INSTALL): guild snowflake if invoked in a guild, or
 *   the literal string `"0"` if invoked in a DM with the app's bot.
 * - `"1"` (USER_INSTALL): user snowflake of the authorizing user.
 */
export const authorizingIntegrationOwnersSchema = v.object({
  [String(ApplicationIntegrationTypes.GUILD_INSTALL)]: v.exactOptional(
    v.union([snowflake, v.literal(`0`)])
  ),
  [String(ApplicationIntegrationTypes.USER_INSTALL)]: v.exactOptional(snowflake)
});
