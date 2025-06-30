import type { InferOutput } from "valibot";
import { array, maxLength, nonEmpty, object, pipe, string } from "valibot";
import { messageComponentSchema } from "../../messages/index.js";

export const modalSubmitData = object({
  /** custom_id of the modal */
  customId: pipe(string(), nonEmpty(), maxLength(100)),
  /** Values submitted by the user */
  components: array(messageComponentSchema)
});

export type ModalSubmitData = InferOutput<typeof modalSubmitData>;
