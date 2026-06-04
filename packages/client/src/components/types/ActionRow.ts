import * as v from "valibot";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { schema } from "@discordkit/core/validations/schema";
import { ComponentType } from "./ComponentType.js";
import { buttonSchema } from "./Button.js";
import { textInputSchema } from "./TextInput.js";
import { selectSchema } from "./Select.js";

const _actionRowSchema = v.object({
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

export interface ActionRow extends v.InferOutput<typeof _actionRowSchema> {}

/**
 * ### [Action Row](https://discord.com/developers/docs/components/reference#action-row)
 *
 * An Action Row is a top-level layout component. Action Rows can contain one of the following: - Up to 5 contextually grouped buttons - A single select component (string select, user select, role select, mentionable select, or channel select)
 */
export const actionRowSchema = schema<ActionRow>(_actionRowSchema);
