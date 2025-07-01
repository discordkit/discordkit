import * as v from "valibot";
import { componentTypeSchema } from "../../components/types/ComponentType.js";
import { selectOptionSchema } from "../../components/types/SelectOption.js";
import { resolvedDataSchema } from "./ResolvedData.js";

export const messageComponentData = v.object({
  /** custom_id of the component */
  customId: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
  /** type of the component */
  componentType: componentTypeSchema,
  /** Values the user selected in a select menu component */
  values: v.exactOptional(v.array(selectOptionSchema)),
  /** Resolved entities from selected options */
  resolved: v.exactOptional(resolvedDataSchema)
});

export interface MessageComponentData
  extends v.InferOutput<typeof messageComponentData> {}
