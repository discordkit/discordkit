import * as v from "valibot";
import { boundedString } from "@discordkit/core";
import { messageComponentSchema } from "../../messages/index.js";

export const modalSubmitData = v.object({
  /** custom_id of the modal */
  customId: boundedString({ max: 100 }),
  /** Values submitted by the user */
  components: v.array(messageComponentSchema)
});

export interface ModalSubmitData
  extends v.InferOutput<typeof modalSubmitData> {}
