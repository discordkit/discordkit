import {
  object,
  nullish,
  string,
  boolean,
  partial,
  array,
  number,
  integer,
  minValue,
  type InferOutput,
  pipe,
  nullable,
  nonEmpty,
  exactOptional,
  url,
  maxLength,
  entriesFromList
} from "valibot";
import { asInteger, snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { teamSchema } from "../../teams/types/Team.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { applicationFlag } from "./ApplicationFlags.js";
import { applicationEventWebhookStatusSchema } from "./ApplicationEventWebhookStatus.js";
import { installParamsSchema } from "./InstallParams.js";
import { ApplicationIntegrationTypes } from "./ApplicationIntegrationTypes.js";
import { applicationIntegrationTypeConfigurationSchema } from "./ApplicationIntegrationTypeConfiguration.js";

// https://discord.com/developers/docs/resources/application#application-object-application-structure

export const applicationSchema = object({
  /** ID of the app */
  id: snowflake,
  /** Name of the app */
  name: string(),
  /** Icon hash of the app */
  icon: nullable(pipe(string(), nonEmpty())),
  /** Description of the app */
  description: string(),
  /** List of RPC origin URLs, if RPC is enabled */
  rpcOrigins: exactOptional(array(pipe(string(), url()))),
  /** When `false`, only the app owner can add the app to guilds */
  botPublic: boolean(),
  /** When `true`, the app's bot will only join upon completion of the full OAuth2 code grant flow */
  botRequireCodeGrant: boolean(),
  /** Partial user object for the bot user associated with the app */
  bot: exactOptional(partial(userSchema)),
  /** URL of the app's Terms of Service */
  termsOfServiceUrl: exactOptional(string()),
  /** URL of the app's Privacy Policy */
  privacyPolicyUrl: exactOptional(string()),
  /** Partial user object for the owner of the app */
  owner: exactOptional(partial(userSchema)),
  /** Hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verifyKey: string(),
  /** If the app belongs to a team, this will be a list of the members of that team */
  team: nullable(teamSchema),
  /** Guild associated with the app. For example, a developer support server. */
  guildId: exactOptional(string()),
  /** Partial object of the associated guild */
  guild: exactOptional(partial(guildSchema)),
  /** If this app is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists */
  primarySkuId: exactOptional(string()),
  /** If this app is a game sold on Discord, this field will be the URL slug that links to the store page */
  slug: exactOptional(string()),
  /** App's default rich presence invite cover image hash */
  coverImage: exactOptional(string()),
  /** App's public flags */
  flags: exactOptional(asInteger(applicationFlag)),
  /** Approximate count of guilds the app has been added to */
  approximateGuildCount: exactOptional(pipe(number(), integer(), minValue(0))),
  /** Approximate count of users that have installed the app (authorized with `application.commands` as a scope) */
  approximateUserInstallCount: exactOptional(
    pipe(number(), integer(), minValue(0))
  ),
  /** Approximate count of users that have OAuth2 authorizations for the app */
  approximateUserAuthorizationCount: exactOptional(
    pipe(number(), integer(), minValue(0))
  ),
  /** Array of redirect URIs for the app */
  redirectUris: nullish(array(pipe(string(), url()))),
  /** Interactions endpoint URL for the app */
  interactionsEndpointUrl: nullish(pipe(string(), url())),
  /** Role connection verification URL for the app */
  roleConnectionsVerificationUrl: nullish(pipe(string(), url())),
  /** Event webhooks URL for the app to receive webhook events */
  eventWebhooksUrl: nullish(pipe(string(), url())),
  /** If webhook events are enabled for the app. `1` (default) means disabled, `2` means enabled, and `3` means disabled by Discord */
  eventWebhooksStatus: applicationEventWebhookStatusSchema,
  /** List of Webhook event types the app subscribes to */
  eventWebhooksTypes: exactOptional(array(pipe(string(), nonEmpty()))),
  /** List of tags describing the content and functionality of the app. Max of 5 tags. */
  tags: exactOptional(pipe(array(pipe(string(), nonEmpty())), maxLength(5))),
  /** Settings for the app's default in-app authorization link, if enabled */
  installParams: exactOptional(installParamsSchema),
  /** Default scopes and permissions for each supported installation context. Value for each key is an integration type configuration object */
  integrationTypesConfig: exactOptional(
    object(
      entriesFromList(
        Object.values(ApplicationIntegrationTypes),
        applicationIntegrationTypeConfigurationSchema
      )
    )
  ),
  /** Default custom authorization URL for the app, if enabled */
  customInstallUrl: exactOptional(pipe(string(), url()))
});

export type Application = InferOutput<typeof applicationSchema>;
