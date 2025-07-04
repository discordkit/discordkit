import * as v from "valibot";
import { boundedInteger, boundedString } from "@discordkit/core";
import { ComponentType } from "./ComponentType.js";
import { selectDefaultValueSchema } from "./SelectDefaultValue.js";

/**
 * A Mentionable Select is an interactive component that allows users to select one or more mentionables in a message. Options are automatically populated based on available mentionables in the server.
 *
 * Mentionable Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s), your app receives an interaction.
 *
 * Mentionable Selects must be placed inside an Action Row and are only available in messages. An Action Row can contain only one select menu and cannot contain buttons if it has a select menu.
 */
export const mentionableSelectSchema = v.object({
  /** `7` for mentionable select */
  type: v.literal(ComponentType.MentionableSelect),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Developer-defined identifier for the input; max 100 characters */
  customId: boundedString({ max: 100 }),
  /** Placeholder text if nothing is selected; max 150 characters */
  placeholder: v.exactOptional(boundedString({ max: 150 })),
  /** List of default values for auto-populated select menu components; number of default values must be in the range defined by `minValues` and `maxValues` */
  defaultValues: v.exactOptional(v.array(selectDefaultValueSchema)),
  /** Minimum number of items that must be chosen (defaults to 1); min 0, max 25 */
  minValues: v.exactOptional(boundedInteger({ max: 25 })),
  /** Maximum number of items that can be chosen (defaults to 1); max 25 */
  maxValues: v.exactOptional(boundedInteger({ min: 1, max: 25 })),
  /** Whether select menu is disabled (defaults to `false`) */
  disabled: v.exactOptional(v.boolean())
});

export interface MentionableSelect
  extends v.InferOutput<typeof mentionableSelectSchema> {}
