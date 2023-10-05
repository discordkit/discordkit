import { z } from "zod";
import { interactionCallbackSchema } from "./InteractionCallbackType.js";
import { interactionCallbackDataSchema } from "./InteractionCallbackData.js";

export const interactionResponseSchema = z.object({
  /** the type of response */
  type: interactionCallbackSchema,
  /** an optional response message */
  data: interactionCallbackDataSchema.nullish()
});

export type InteractionResponse = z.infer<typeof interactionResponseSchema>;
