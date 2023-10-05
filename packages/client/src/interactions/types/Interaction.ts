import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { localesSchema } from "../../application/types/Locales.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { messageSchema } from "../../channel/types/Message.js";
import { userSchema } from "../../user/types/User.js";
import { interactionTypeSchema } from "./InteractionType.js";
import { interactionDataSchema } from "./InteractionData.js";

export const interactionSchema = z.object({
  /** ID of the interaction */
  id: snowflake,
  /** ID of the application this interaction is for */
  applicationId: snowflake,
  /** Type of interaction */
  type: interactionTypeSchema,
  /** Interaction data payload */
  data: interactionDataSchema.nullish(),
  /** Guild that the interaction was sent from */
  guildId: snowflake.nullish(),
  /** Channel that the interaction was sent from */
  channel: channelSchema.partial().nullish(),
  /** Channel that the interaction was sent from */
  channelId: snowflake.nullish(),
  /** Guild member data for the invoking user, including permissions */
  member: memberSchema.nullish(),
  /** User object for the invoking user, if invoked in a DM */
  user: userSchema.nullish(),
  /** Continuation token for responding to the interaction */
  token: z.string(),
  /** Read-only property, always 1 */
  version: z.literal(1),
  /** For components, the message they were attached to */
  message: messageSchema.nullish(),
  /** Bitwise set of permissions the app or bot has within the channel the interaction was sent from */
  appPermissions: z.string().nullish(),
  /** Selected language of the invoking user */
  locale: localesSchema.nullish(),
  /** Guild's preferred locale, if invoked in a guild */
  guildLocale: localesSchema.nullish()
});

export type Interaction = z.infer<typeof interactionSchema>;
