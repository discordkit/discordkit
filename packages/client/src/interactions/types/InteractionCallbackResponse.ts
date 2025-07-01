import * as v from "valibot";
import { interactionCallbackSchema } from "./InteractionCallback.js";
import { interactionCallbackResourceSchema } from "./InteractionCallbackResource.js";

export const interactionCallbackResponseSchema = v.object({
  /** The interaction object associated with the interaction response. */
  interaction: interactionCallbackSchema,
  /** The resource that was created by the interaction response. */
  resource: v.exactOptional(interactionCallbackResourceSchema)
});

export interface InteractionCallbackResponse
  extends v.InferOutput<typeof interactionCallbackResponseSchema> {}
