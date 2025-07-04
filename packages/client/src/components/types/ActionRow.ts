import * as v from "valibot";
import { boundedArray, boundedInteger } from "@discordkit/core";
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
export const actionRowSchema = v.object({
  /** `1` for action row component */
  type: v.literal(ComponentType.ActionRow),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Up to 5 interactive button components or a single select component */
  components: v.union([
    boundedArray(buttonSchema, { max: 5 }),
    textInputSchema,
    selectSchema
  ])
});

export interface ActionRow extends v.InferOutput<typeof actionRowSchema> {}
