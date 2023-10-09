import { object, nullish, type Output } from "valibot";
import { interactionCallbackSchema } from "./InteractionCallbackType.js";
import { interactionCallbackDataSchema } from "./InteractionCallbackData.js";

export const interactionResponseSchema = object({
  /** the type of response */
  type: interactionCallbackSchema,
  /** an optional response message */
  data: nullish(interactionCallbackDataSchema)
});

export type InteractionResponse = Output<typeof interactionResponseSchema>;
