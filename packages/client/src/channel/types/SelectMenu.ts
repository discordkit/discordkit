import { z } from "zod";
import { ComponentType } from "./ComponentType.ts";
import { selectOptionSchema } from "./SelectOption.ts";
import { selectDefaultValueSchema } from "./SelectDefaultValue.ts";
import { channelTypeSchema } from "./ChannelType.ts";

export const selectMenuSchema = z.object({
  /** Type of select menu component (text: 3, user: 5, role: 6, mentionable: 7, channels: 8) */
  type: z.union([
    z.literal(ComponentType.StringSelect),
    z.literal(ComponentType.UserSelect),
    z.literal(ComponentType.RoleSelect),
    z.literal(ComponentType.MentionableSelect),
    z.literal(ComponentType.ChannelSelect)
  ]),
  /** ID for the select menu; max 100 characters */
  customId: z.string().max(100),
  /** Specified choices in a select menu (only required and available for string selects (type 3); max 25 */
  options: selectOptionSchema.array().max(25).nullish(),
  /** List of channel types to include in the channel select component (type 8) */
  channelTypes: channelTypeSchema.array().nullish(),
  /** Placeholder text if nothing is selected; max 150 characters */
  placeholder: z.string().max(150).nullish(),
  /** List of default values for auto-populated select menu components; number of default values must be in the range defined by min_values and max_values */
  defaultValues: selectDefaultValueSchema.array().nullish(),
  /** Minimum number of items that must be chosen (defaults to 1); min 0, max 25 */
  minValues: z.number().int().min(0).max(25).nullish().default(1),
  /** Maximum number of items that can be chosen (defaults to 1); max 25 */
  maxValues: z.number().int().min(1).max(25).nullish().default(1),
  /** Whether select menu is disabled (defaults to false) */
  disabled: z.boolean().nullish().default(false)
});

export type SelectMenu = z.infer<typeof selectMenuSchema>;
