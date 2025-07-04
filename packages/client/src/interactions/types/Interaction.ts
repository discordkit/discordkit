import * as v from "valibot";
import {
  snowflake,
  asDigits,
  boundedString,
  boundedInteger
} from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import type { Locales } from "../../application/types/Locales.js";
import { localesSchema } from "../../application/types/Locales.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { messageSchema } from "../../messages/types/Message.js";
import type { User } from "../../user/types/User.js";
import { userSchema } from "../../user/types/User.js";
import { interactionTypeSchema } from "./InteractionType.js";
import { applicationCommandDataSchema } from "./ApplicationCommandData.js";
import { guildSchema } from "../../guild/types/index.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { entitlementSchema } from "../../entitlements/types/Entitlement.js";
import { ApplicationIntegrationTypes } from "../../application/types/ApplicationIntegrationTypes.js";
import { applicationIntegrationTypeConfigurationSchema } from "../../application/types/ApplicationIntegrationTypeConfiguration.js";
import { interactionContextSchema } from "./InteractionContextType.js";

export const interactionSchema = v.object({
  /** ID of the interaction */
  id: snowflake,
  /** ID of the application this interaction is for */
  applicationId: snowflake,
  /** Type of interaction */
  type: interactionTypeSchema,
  /** Interaction data payload */
  data: v.exactOptional(applicationCommandDataSchema),
  /** Guild that the interaction was sent from */
  guild: v.exactOptional(v.partial(guildSchema)),
  /** Guild that the interaction was sent from */
  guildId: v.exactOptional(snowflake),
  /** Channel that the interaction was sent from */
  channel: v.exactOptional(channelSchema),
  /** Channel that the interaction was sent from */
  channelId: v.exactOptional(snowflake),
  /** Guild member data for the invoking user, including permissions */
  member: v.exactOptional(memberSchema),
  /** User object for the invoking user, if invoked in a DM */
  user: v.exactOptional(v.lazy<v.GenericSchema<User>>(() => userSchema)),
  /** Continuation token for responding to the interaction */
  token: boundedString(),
  /** Read-only property, always 1 */
  version: v.literal(1),
  /** For components, the message they were attached to */
  message: v.exactOptional(v.lazy<v.GenericSchema>(() => messageSchema)),
  /** Bitwise set of permissions the app or bot has within the channel the interaction was sent from */
  appPermissions: asDigits(permissionFlag),
  /** Selected language of the invoking user */
  locale: v.exactOptional<v.GenericSchema<Locales>>(localesSchema),
  /** Guild's preferred locale, if invoked in a guild */
  guildLocale: v.exactOptional<v.GenericSchema<Locales>>(localesSchema),
  /** For monetized apps, any entitlements for the invoking user, representing access to premium SKUs */
  entitlements: v.array(entitlementSchema),
  authorizingIntegrationOwners: v.object(
    v.entriesFromList(
      Object.values(ApplicationIntegrationTypes),
      applicationIntegrationTypeConfigurationSchema
    )
  ),
  /** Context where the interaction was triggered from */
  context: v.exactOptional(interactionContextSchema),
  /** Attachment size limit in bytes */
  attachmentSizeLimit: boundedInteger()
});

export interface Interaction extends v.InferOutput<typeof interactionSchema> {}
