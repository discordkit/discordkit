import {
  object,
  literal,
  union,
  array,
  type InferOutput,
  pipe,
  maxLength,
  exactOptional,
  number,
  integer,
  minValue,
  maxValue
} from "valibot";
import { ComponentType } from "./ComponentType.js";
import { buttonSchema } from "./Button.js";
import { textInputSchema } from "./TextInput.js";
import { selectSchema } from "./Select.js";

/**
 * An Action Row is a top-level layout component used in messages and modals
 *
 * Action Rows can contain:
 *
 * - Up to 5 contextually grouped buttons
 * - A single text input
 * - A single select component (string select, user select, role select, mentionable select, or channel select)
 */
export const actionRowSchema = object({
  /** `1` for action row component */
  type: literal(ComponentType.ActionRow),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** Up to 5 interactive button components or a single select component */
  components: union([
    pipe(array(buttonSchema), maxLength(5)),
    textInputSchema,
    selectSchema
  ])
});

export interface ActionRow extends InferOutput<typeof actionRowSchema> {}
