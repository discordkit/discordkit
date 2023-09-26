import { z } from "zod";
import { memberSchema } from "../../guild/types/Member";
import { localesSchema } from "../../application/types/Locales";
import { channelSchema } from "../../channel/types/Channel";
import { messageSchema } from "../../channel/types/Message";
import { userSchema } from "../../user/types/User";
import { interactionTypeSchema } from "./InteractionType";
import { interactionDataSchema } from "./InteractionData";

export const interactionSchema = z.object({
  /** ID of the interaction */
  id: z.string().min(1),
  /** ID of the application this interaction is for */
  applicationId: z.string().min(1),
  /** Type of interaction */
  type: interactionTypeSchema,
  /** Interaction data payload */
  data: interactionDataSchema.nullable(),
  /** Guild that the interaction was sent from */
  guildId: z.string().min(1).nullable(),
  /** Channel that the interaction was sent from */
  channel: channelSchema.partial().nullable(),
  /** Channel that the interaction was sent from */
  channelId: z.string().min(1).nullable(),
  /** Guild member data for the invoking user, including permissions */
  member: memberSchema.nullable(),
  /** User object for the invoking user, if invoked in a DM */
  user: userSchema.nullable(),
  /** Continuation token for responding to the interaction */
  token: z.string(),
  /** Read-only property, always 1 */
  version: z.literal(1),
  /** For components, the message they were attached to */
  message: messageSchema.nullable(),
  /** Bitwise set of permissions the app or bot has within the channel the interaction was sent from */
  appPermissions: z.string().nullable(),
  /** Selected language of the invoking user */
  locale: localesSchema.nullable(),
  /** Guild's preferred locale, if invoked in a guild */
  guildLocale: localesSchema.nullable()
});

export type Interaction = z.infer<typeof interactionSchema>;
