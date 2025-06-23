import {
  object,
  nullish,
  partial,
  string,
  literal,
  number,
  integer,
  type InferOutput,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { memberSchema } from "../../guild/types/Member.js";
import { localesSchema } from "../../application/types/Locales.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { messageSchema } from "../../channel/types/Message.js";
import { userSchema } from "../../user/types/User.js";
import { interactionTypeSchema } from "./InteractionType.js";
import { interactionDataSchema } from "./InteractionData.js";

export const interactionSchema = object({
  /** ID of the interaction */
  id: snowflake,
  /** ID of the application this interaction is for */
  applicationId: snowflake,
  /** Type of interaction */
  type: interactionTypeSchema,
  /** Interaction data payload */
  data: nullish(interactionDataSchema),
  /** Guild that the interaction was sent from */
  guildId: nullish(snowflake),
  /** Channel that the interaction was sent from */
  channel: nullish(partial(channelSchema)),
  /** Channel that the interaction was sent from */
  channelId: nullish(snowflake),
  /** Guild member data for the invoking user, including permissions */
  member: nullish(memberSchema),
  /** User object for the invoking user, if invoked in a DM */
  user: nullish(userSchema),
  /** Continuation token for responding to the interaction */
  token: string(),
  /** Read-only property, always 1 */
  version: literal(1),
  /** For components, the message they were attached to */
  message: nullish(messageSchema),
  /** Bitwise set of permissions the app or bot has within the channel the interaction was sent from */
  appPermissions: nullish(pipe(number(), integer())),
  /** Selected language of the invoking user */
  locale: nullish(localesSchema),
  /** Guild's preferred locale, if invoked in a guild */
  guildLocale: nullish(localesSchema)
});

export type Interaction = InferOutput<typeof interactionSchema>;
