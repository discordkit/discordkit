import { z } from "zod";
import { interactionCallbackSchema } from "./InteractionCallbackType";
import { interactionCallbackDataSchema } from "./InteractionCallbackData";

export const interactionResponseSchema = z.object({
  /** the type of response */
  type: interactionCallbackSchema,
  /** an optional response message */
  data: interactionCallbackDataSchema.nullable()
});

export type InteractionResponse = z.infer<typeof interactionResponseSchema>;
