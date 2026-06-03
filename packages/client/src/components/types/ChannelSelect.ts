import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { ComponentType } from "./ComponentType.js";
import { channelSelectDefaultValueSchema } from "./SelectDefaultValue.js";
import { channelTypeSchema } from "../../channel/types/ChannelType.js";

/**
 * ### [Channel Select](https://discord.com/developers/docs/components/reference#channel-select)
 *
 * A Channel Select is an interactive component that allows users to select one or more channels in a message or modal. Options are automatically populated based on available channels in the server and can be filtered by channel types. Channel Selects can be configured for both single-select and multi-select behavior. When a user finishes making their choice(s) your app receives an interaction. Channel Selects are available in messages and modals. They must be placed inside an Action Row in messages and a Label in modals.
 */
export const channelSelectSchema = v.object({
  /** `8` for channel select */
  type: v.literal(ComponentType.ChannelSelect),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Developer-defined identifier for the input; max 100 characters */
  customId: v.pipe(boundedString({ max: 100 })),
  /** List of channel types to include in the channel select component */
  channelTypes: v.exactOptional(v.array(channelTypeSchema)),
  /** Placeholder text if nothing is selected; max 150 characters */
  placeholder: v.exactOptional(boundedString({ max: 150 })),
  /** List of default values for auto-populated select menu components; number of default values must be in the range defined by `minValues` and `maxValues` */
  defaultValues: v.exactOptional(v.array(channelSelectDefaultValueSchema)),
  /** Minimum number of items that must be chosen (defaults to 1); min 0, max 25 */
  minValues: v.exactOptional(boundedInteger({ min: 0, max: 25 })),
  /** Maximum number of items that can be chosen (defaults to 1); max 25 */
  maxValues: v.exactOptional(boundedInteger({ min: 1, max: 25 })),
  /** Whether select menu is disabled (defaults to `false`) */
  disabled: v.exactOptional(v.boolean())
});

export interface ChannelSelect extends v.InferOutput<
  typeof channelSelectSchema
> {}
