import type { InferOutput } from "valibot";
import { exactOptional, object } from "valibot";
import { interactionCallbackSchema } from "./InteractionCallback.js";
import { interactionCallbackResourceSchema } from "./InteractionCallbackResource.js";

export const interactionCallbackResponseSchema = object({
  /** The interaction object associated with the interaction response. */
  interaction: interactionCallbackSchema,
  /** The resource that was created by the interaction response. */
  resource: exactOptional(interactionCallbackResourceSchema)
});

export interface InteractionCallbackResponse
  extends InferOutput<typeof interactionCallbackResponseSchema> {}
