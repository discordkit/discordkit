import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { pickFields, schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { url } from "@discordkit/core/validations/url";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { buttonStyleSchema } from "./ButtonStyle.js";
import { ComponentType } from "./ComponentType.js";

const _buttonSchema = v.object({
  /** `2` for a button */
  type: v.literal(ComponentType.Button),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** A button style */
  style: buttonStyleSchema,
  /** Text that appears on the button; max 80 characters */
  label: v.exactOptional(boundedString({ max: 80 })),
  /** `name`, `id`, and `animated` */
  emoji: v.exactOptional(pickFields(emojiSchema, [`id`, `name`, `animated`])),
  /** Developer-defined identifier for the button; 1-100 characters */
  customId: v.exactOptional(boundedString({ max: 100 })),
  /** Identifier for a purchasable SKU, only available when using premium-style buttons */
  skuId: v.exactOptional(snowflake),
  /** URL for link-style buttons; max 512 characters */
  url: v.exactOptional(url),
  /** Whether the button is disabled (defaults to `false`) */
  disabled: v.exactOptional(v.boolean())
});

export interface Button extends v.InferOutput<typeof _buttonSchema> {}

/**
 * ### [Button](https://discord.com/developers/docs/components/reference#button)
 *
 * A Button is an interactive component that can only be used in messages. It creates clickable elements that users can interact with, sending an interaction to your app when clicked. Buttons must be placed inside an Action Row or a Section's `accessory` field.
 */
export const buttonSchema = schema<Button>(_buttonSchema);
