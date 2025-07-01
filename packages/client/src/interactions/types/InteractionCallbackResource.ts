import type { InferOutput } from "valibot";
import { object, exactOptional } from "valibot";
import { messageSchema } from "../../messages/index.js";
import { interactionCallbackTypeSchema } from "./InteractionCallbackType.js";
import { interactionCallbackActivityInstanceSchema } from "./InteractionCallbackActivityInstance.js";

export const interactionCallbackResourceSchema = object({
  /** Interaction callback type */
  type: interactionCallbackTypeSchema,
  /** Represents the Activity launched by this interaction. (Only present if type is `LAUNCH_ACTIVITY`) */
  activityInstance: exactOptional(interactionCallbackActivityInstanceSchema),
  /** Message created by the interaction. (Only present if type is either `CHANNEL_MESSAGE_WITH_SOURCE` or `UPDATE_MESSAGE`) */
  message: exactOptional(messageSchema)
});

export interface InteractionCallbackResource
  extends InferOutput<typeof interactionCallbackResourceSchema> {}
