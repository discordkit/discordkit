import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { modalSubmitComponentSchema } from "./ComponentInteractionResponse.js";
import { type ResolvedData, resolvedDataSchema } from "./ResolvedData.js";

export const modalSubmitData = v.object({
  /** custom_id of the modal */
  customId: boundedString({ max: 100 }),
  /** Values submitted by the user, as the response structure of each component rather than the components the modal was created with */
  components: v.array(modalSubmitComponentSchema),
  /** Resolved entities from selected options and uploaded files */
  resolved: v.exactOptional(resolvedDataSchema as v.GenericSchema<ResolvedData>)
});

export interface ModalSubmitData extends v.InferOutput<
  typeof modalSubmitData
> {}
