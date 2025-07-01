import * as v from "valibot";
import { messageComponentSchema } from "../../messages/index.js";

export const modalSubmitData = v.object({
  /** custom_id of the modal */
  customId: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
  /** Values submitted by the user */
  components: v.array(messageComponentSchema)
});

export interface ModalSubmitData
  extends v.InferOutput<typeof modalSubmitData> {}
