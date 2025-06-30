import {
  array,
  exactOptional,
  maxLength,
  nonEmpty,
  object,
  pipe,
  string,
  type InferOutput
} from "valibot";
import { componentTypeSchema } from "../../components/types/ComponentType.js";
import { selectOptionSchema } from "../../components/types/SelectOption.js";
import { resolvedDataSchema } from "./ResolvedData.js";

export const messageComponentData = object({
  /** custom_id of the component */
  customId: pipe(string(), nonEmpty(), maxLength(100)),
  /** type of the component */
  componentType: componentTypeSchema,
  /** Values the user selected in a select menu component */
  values: exactOptional(array(selectOptionSchema)),
  /** Resolved entities from selected options */
  resolved: exactOptional(resolvedDataSchema)
});

export type MessageComponentData = InferOutput<typeof messageComponentData>;
