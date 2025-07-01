import * as v from "valibot";
import { actionRowSchema } from "../../components/types/ActionRow.js";

export const messageComponentSchema = v.pipe(
  v.array(actionRowSchema),
  v.maxLength(5)
);

export interface MessageComponent
  extends v.InferOutput<typeof messageComponentSchema> {}
