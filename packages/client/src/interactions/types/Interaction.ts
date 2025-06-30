import {
  object,
  exactOptional,
  partial,
  string,
  literal,
  number,
  integer,
  pipe,
  nonEmpty,
  minValue,
  array,
  entriesFromList,
  lazy,
  type InferOutput,
  type GenericSchema
} from "valibot";
import { snowflake, asDigits } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { localesSchema } from "../../application/types/Locales.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { type Message, messageSchema } from "../../messages/types/Message.js";
import { type User, userSchema } from "../../user/types/User.js";
import { interactionTypeSchema } from "./InteractionType.js";
import { applicationCommandDataSchema } from "./ApplicationCommandData.js";
import { guildSchema } from "../../guild/types/index.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { entitlementSchema } from "../../entitlements/types/Entitlement.js";
import { ApplicationIntegrationTypes } from "../../application/types/ApplicationIntegrationTypes.js";
import { applicationIntegrationTypeConfigurationSchema } from "../../application/types/ApplicationIntegrationTypeConfiguration.js";
import { interactionContextSchema } from "./InteractionContextType.js";

export const interactionSchema = object({
  /** ID of the interaction */
  id: snowflake,
  /** ID of the application this interaction is for */
  applicationId: snowflake,
  /** Type of interaction */
  type: interactionTypeSchema,
  /** Interaction data payload */
  data: exactOptional(applicationCommandDataSchema),
  /** Guild that the interaction was sent from */
  guild: exactOptional(partial(guildSchema)),
  /** Guild that the interaction was sent from */
  guildId: exactOptional(snowflake),
  /** Channel that the interaction was sent from */
  channel: exactOptional(channelSchema),
  /** Channel that the interaction was sent from */
  channelId: exactOptional(snowflake),
  /** Guild member data for the invoking user, including permissions */
  member: exactOptional(memberSchema),
  /** User object for the invoking user, if invoked in a DM */
  // @ts-expect-error
  user: exactOptional(lazy<GenericSchema<User>>(() => userSchema)),
  /** Continuation token for responding to the interaction */
  token: pipe(string(), nonEmpty()),
  /** Read-only property, always 1 */
  version: literal(1),
  /** For components, the message they were attached to */
  message: exactOptional(lazy<GenericSchema<Message>>(() => messageSchema)),
  /** Bitwise set of permissions the app or bot has within the channel the interaction was sent from */
  appPermissions: asDigits(permissionFlag),
  /** Selected language of the invoking user */
  locale: exactOptional(localesSchema),
  /** Guild's preferred locale, if invoked in a guild */
  guildLocale: exactOptional(localesSchema),
  /** For monetized apps, any entitlements for the invoking user, representing access to premium SKUs */
  entitlements: array(entitlementSchema),
  authorizingIntegrationOwners: object(
    entriesFromList(
      Object.values(ApplicationIntegrationTypes),
      applicationIntegrationTypeConfigurationSchema
    )
  ),
  /** Context where the interaction was triggered from */
  context: exactOptional(interactionContextSchema),
  /** Attachment size limit in bytes */
  attachmentSizeLimit: pipe(number(), integer(), minValue(0))
});

export type Interaction = InferOutput<typeof interactionSchema>;
