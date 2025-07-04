import * as v from "valibot";
import { boundedString, snowflake } from "@discordkit/core";
import { interactionTypeSchema } from "./InteractionType.js";

export const interactionCallbackSchema = v.object({
  /** ID of the interaction */
  id: snowflake,
  /** Interaction type */
  type: interactionTypeSchema,
  /** Instance ID of the Activity if one was launched or joined */
  activityInstanceId: v.exactOptional(boundedString()),
  /** ID of the message that was created by the interaction */
  responseMessageId: v.exactOptional(snowflake),
  /** Whether or not the message is in a loading state */
  responseMessageLoading: v.exactOptional(v.boolean()),
  /** Whether or not the response message was ephemeral */
  responseMessageEphemeral: v.exactOptional(v.boolean())
});

export interface InteractionCallback
  extends v.InferOutput<typeof interactionCallbackSchema> {}
