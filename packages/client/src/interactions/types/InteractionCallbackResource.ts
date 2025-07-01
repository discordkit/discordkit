import * as v from "valibot";
import { messageSchema } from "../../messages/index.js";
import { interactionCallbackTypeSchema } from "./InteractionCallbackType.js";
import { interactionCallbackActivityInstanceSchema } from "./InteractionCallbackActivityInstance.js";

export const interactionCallbackResourceSchema = v.object({
  /** Interaction callback type */
  type: interactionCallbackTypeSchema,
  /** Represents the Activity launched by this interaction. (Only present if type is `LAUNCH_ACTIVITY`) */
  activityInstance: v.exactOptional(interactionCallbackActivityInstanceSchema),
  /** Message created by the interaction. (Only present if type is either `CHANNEL_MESSAGE_WITH_SOURCE` or `UPDATE_MESSAGE`) */
  message: v.exactOptional(messageSchema)
});

export interface InteractionCallbackResource
  extends v.InferOutput<typeof interactionCallbackResourceSchema> {}
