import type { InferOutput } from "valibot";
import {
  boolean,
  exactOptional,
  nonEmpty,
  object,
  pipe,
  string
} from "valibot";
import { snowflake } from "@discordkit/core";
import { interactionTypeSchema } from "./InteractionType.js";

export const interactionCallbackSchema = object({
  /** ID of the interaction */
  id: snowflake,
  /** Interaction type */
  type: interactionTypeSchema,
  /** Instance ID of the Activity if one was launched or joined */
  activityInstanceId: exactOptional(pipe(string(), nonEmpty())),
  /** ID of the message that was created by the interaction */
  responseMessageId: exactOptional(snowflake),
  /** Whether or not the message is in a loading state */
  responseMessageLoading: exactOptional(boolean()),
  /** Whether or not the response message was ephemeral */
  responseMessageEphemeral: exactOptional(boolean())
});

export interface InteractionCallback
  extends InferOutput<typeof interactionCallbackSchema> {}
