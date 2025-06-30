import { array, maxLength, pipe, type InferOutput } from "valibot";
import { actionRowSchema } from "../../components/types/ActionRow.js";

export const messageComponentSchema = pipe(
  array(actionRowSchema),
  maxLength(5)
);

export type MessageComponent = InferOutput<typeof messageComponentSchema>;
