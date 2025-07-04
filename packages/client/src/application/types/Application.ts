import * as v from "valibot";
import {
  asInteger,
  boundedArray,
  boundedInteger,
  boundedString,
  snowflake,
  url
} from "@discordkit/core";
import type { User } from "../../user/types/User.js";
import { userSchema } from "../../user/types/User.js";
import { teamSchema } from "../../teams/types/Team.js";
import { guildSchema } from "../../guild/types/Guild.js";
import { applicationFlag } from "./ApplicationFlags.js";
import { applicationEventWebhookStatusSchema } from "./ApplicationEventWebhookStatus.js";
import { installParamsSchema } from "./InstallParams.js";
import { ApplicationIntegrationTypes } from "./ApplicationIntegrationTypes.js";
import { applicationIntegrationTypeConfigurationSchema } from "./ApplicationIntegrationTypeConfiguration.js";

// https://discord.com/developers/docs/resources/application#application-object-application-structure

export const applicationSchema = v.object({
  /** ID of the app */
  id: snowflake,
  /** Name of the app */
  name: v.string(),
  /** Icon hash of the app */
  icon: v.nullable(boundedString()),
  /** Description of the app */
  description: v.string(),
  /** List of RPC origin URLs, if RPC is enabled */
  rpcOrigins: v.exactOptional(v.array(url)),
  /** When `false`, only the app owner can add the app to guilds */
  botPublic: v.boolean(),
  /** When `true`, the app's bot will only join upon completion of the full OAuth2 code grant flow */
  botRequireCodeGrant: v.boolean(),
  /** Partial user object for the bot user associated with the app */
  bot: v.exactOptional(v.partial(userSchema) as v.GenericSchema<Partial<User>>),
  /** URL of the app's Terms of Service */
  termsOfServiceUrl: v.exactOptional(url),
  /** URL of the app's Privacy Policy */
  privacyPolicyUrl: v.exactOptional(url),
  /** Partial user object for the owner of the app */
  owner: v.exactOptional(
    v.partial(userSchema) as v.GenericSchema<Partial<User>>
  ),
  /** Hex encoded key for verification in interactions and the GameSDK's GetTicket */
  verifyKey: v.string(),
  /** If the app belongs to a team, this will be a list of the members of that team */
  team: v.nullable(teamSchema),
  /** Guild associated with the app. For example, a developer support server. */
  guildId: v.exactOptional(v.string()),
  /** Partial object of the associated guild */
  guild: v.exactOptional(v.partial(guildSchema)),
  /** If this app is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists */
  primarySkuId: v.exactOptional(v.string()),
  /** If this app is a game sold on Discord, this field will be the URL slug that links to the store page */
  slug: v.exactOptional(v.string()),
  /** App's default rich presence invite cover image hash */
  coverImage: v.exactOptional(v.string()),
  /** App's public flags */
  flags: v.exactOptional(asInteger(applicationFlag)),
  /** Approximate count of guilds the app has been added to */
  approximateGuildCount: v.exactOptional(boundedInteger()),
  /** Approximate count of users that have installed the app (authorized with `application.commands` as a scope) */
  approximateUserInstallCount: v.exactOptional(boundedInteger()),
  /** Approximate count of users that have OAuth2 authorizations for the app */
  approximateUserAuthorizationCount: v.exactOptional(boundedInteger()),
  /** Array of redirect URIs for the app */
  redirectUris: v.nullish(v.array(url)),
  /** Interactions endpoint URL for the app */
  interactionsEndpointUrl: v.nullish(url),
  /** Role connection verification URL for the app */
  roleConnectionsVerificationUrl: v.nullish(url),
  /** Event webhooks URL for the app to receive webhook events */
  eventWebhooksUrl: v.nullish(url),
  /** If webhook events are enabled for the app. `1` (default) means disabled, `2` means enabled, and `3` means disabled by Discord */
  eventWebhooksStatus: v.exactOptional(applicationEventWebhookStatusSchema),
  /** List of Webhook event types the app subscribes to */
  eventWebhooksTypes: v.exactOptional(v.array(boundedString())),
  /** List of tags describing the content and functionality of the app. Max of 5 tags. */
  tags: v.exactOptional<v.GenericSchema<string[]>>(
    boundedArray(boundedString(), { max: 5 })
  ),
  /** Settings for the app's default in-app authorization link, if enabled */
  installParams: v.exactOptional(installParamsSchema),
  /** Default scopes and permissions for each supported installation context. Value for each key is an integration type configuration object */
  integrationTypesConfig: v.exactOptional(
    v.partial(
      v.object(
        v.entriesFromList(
          Object.values(ApplicationIntegrationTypes),
          applicationIntegrationTypeConfigurationSchema
        )
      )
    )
  ),
  /** Default custom authorization URL for the app, if enabled */
  customInstallUrl: v.exactOptional(url)
});

export interface Application extends v.InferOutput<typeof applicationSchema> {}
