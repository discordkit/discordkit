import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { datauri } from "@discordkit/core/validations/datauri";
import { url } from "@discordkit/core/validations/url";
import type { Application } from "./types/Application.js";
import { applicationEventWebhookStatusSchema } from "./types/ApplicationEventWebhookStatus.js";
import { applicationFlag } from "./types/ApplicationFlags.js";
import { applicationIntegrationTypeConfigurationSchema } from "./types/ApplicationIntegrationTypeConfiguration.js";
import { ApplicationIntegrationTypes } from "./types/ApplicationIntegrationTypes.js";
import { installParamsSchema } from "./types/InstallParams.js";

export const editCurrentApplicationSchema = v.object({
  body: v.partial(
    v.object({
      /** Default custom authorization URL for the app, if enabled */
      customInstallUrl: url,
      /** Description of the app */
      description: v.string(),
      /** Role connection verification URL for the app */
      roleConnectionsVerificationUrl: url,
      /** Settings for the app's default in-app authorization link, if enabled */
      installParams: installParamsSchema,
      /** Default scopes and permissions for each supported installation context. Value for each key is an integration type configuration object */
      integrationTypesConfig: v.partial(
        v.object(
          v.entriesFromList(
            Object.values(ApplicationIntegrationTypes),
            applicationIntegrationTypeConfigurationSchema
          )
        )
      ),
      /**
       * App's public {@link ApplicationFlags | flags}.
       *
       * Only limited intent flags (`GATEWAY_PRESENCE_LIMITED`,
       * `GATEWAY_GUILD_MEMBERS_LIMITED`, and `GATEWAY_MESSAGE_CONTENT_LIMITED`)
       * can be updated via the API.
       */
      flags: asInteger(applicationFlag),
      /** Icon for the app */
      icon: v.nullable(datauri),
      /** Default rich presence invite cover image for the app */
      coverImage: v.nullable(datauri),
      /**
       * Interactions endpoint URL for the app.
       *
       * The URL must be valid according to the Receiving an Interaction
       * documentation.
       */
      interactionsEndpointUrl: url,
      /** List of tags describing the content and functionality of the app (max of 20 characters per tag). Max of 5 tags. */
      tags: boundedArray(boundedString({ max: 20 }), { max: 5 }),
      /** Event webhooks URL for the app to receive webhook events */
      eventWebhooksUrl: url,
      /** If webhook events are enabled for the app. `1` to disable, and `2` to enable */
      eventWebhooksStatus: applicationEventWebhookStatusSchema,
      /** List of Webhook event types to subscribe to */
      eventWebhooksTypes: v.array(boundedString())
    })
  )
});

/**
 * ### [Edit Current Application](https://discord.com/developers/docs/resources/application#edit-current-application)
 *
 * **PATCH** `/applications/@me`
 *
 * Edit properties of the app associated with the requesting bot user. Only properties that are passed will be updated. Returns the updated {@link Application | application} object on success.
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional.
 */
export const editCurrentApplication: Fetcher<
  typeof editCurrentApplicationSchema,
  Application
> = async ({ body }) => patch(`/applications/@me`, body);
