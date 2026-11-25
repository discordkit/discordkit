import * as v from "valibot";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { schema } from "@discordkit/core/validations/schema";
import { ComponentType } from "./ComponentType.js";
import { buttonSchema } from "./Button.js";
import { type TextInput, textInputSchema } from "./TextInput.js";
import { type Select, selectSchema } from "./Select.js";

const _actionRowSchema = v.object({
  /** `1` for action row component */
  type: v.literal(ComponentType.ActionRow),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Up to 5 interactive button components or a single select component. In a legacy modal, a single text input. Always an array, even when it holds one component. */
  components: v.union([
    boundedArray(buttonSchema, { max: 5 }),
    v.pipe(
      v.array(selectSchema),
      v.length(
        1,
        (issue) =>
          `Expected exactly one select menu in an action row, received: ${issue.received}. Discord allows a single select per row; put each additional select menu in an action row of its own.`
      )
    ) as v.GenericSchema<Select[]>,
    v.pipe(
      v.array(textInputSchema),
      v.length(
        1,
        (issue) =>
          `Expected exactly one text input in an action row, received: ${issue.received}. Discord allows a single text input per row; put each additional text input in an action row of its own, or better, wrap each one in a Label.`
      )
    ) as v.GenericSchema<TextInput[]>
  ])
});

export interface ActionRow extends v.InferOutput<typeof _actionRowSchema> {}

/**
 * ### [Action Row](https://discord.com/developers/docs/components/reference#action-row)
 *
 * An Action Row is a top-level layout component. Action Rows can contain one of the following: - Up to 5 contextually grouped buttons - A single select component (string select, user select, role select, mentionable select, or channel select)
 */
export const actionRowSchema = schema<ActionRow>(_actionRowSchema);
