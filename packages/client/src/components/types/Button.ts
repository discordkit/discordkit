import {
  object,
  literal,
  string,
  maxLength,
  pick,
  url,
  boolean,
  type InferOutput,
  pipe,
  exactOptional,
  number,
  integer,
  maxValue,
  minValue,
  nonEmpty
} from "valibot";
import { snowflake } from "@discordkit/core";
import { emojiSchema } from "../../emoji/types/Emoji.js";
import { buttonStyleSchema } from "./ButtonStyle.js";
import { ComponentType } from "./ComponentType.js";

/**
 * A Button is an interactive component that can only be used in messages. It creates clickable elements that users can interact with, sending an interaction to your app when clicked.
 *
 * Buttons must be placed inside an Action Row or a Section's accessory field.
 *
 * Buttons come in various styles to convey different types of actions. These styles also define what fields are valid for a button.
 *
 * - Non-link and non-premium buttons **must** have a `custom_id`, and cannot have a url or a `sku_id`.
 * - Link buttons **must** have a `url`, and cannot have a `custom_id`
 * - Link buttons do not send an interaction to your app when clicked
 * - Premium buttons **must** contain a `sku_id`, and cannot have a `custom_id`, `label`, `url`, or `emoji`.
 * - Premium buttons do not send an interaction to your app when clicked
 */
export const buttonSchema = object({
  /** `2` for a button */
  type: literal(ComponentType.Button),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** A button style */
  style: buttonStyleSchema,
  /** Text that appears on the button; max 80 characters */
  label: exactOptional(pipe(string(), nonEmpty(), maxLength(80))),
  /** `name`, `id`, and `animated` */
  emoji: exactOptional(pick(emojiSchema, [`id`, `name`, `animated`])),
  /** Developer-defined identifier for the button; max 100 characters */
  customId: exactOptional(pipe(string(), nonEmpty(), maxLength(100))),
  /** Identifier for a purchasable SKU, only available when using premium-style buttons */
  skuId: exactOptional(snowflake),
  /** URL for link-style buttons */
  url: exactOptional(pipe(string(), url())),
  /** Whether the button is disabled (defaults to `false`) */
  disabled: exactOptional(boolean())
});

export interface Button extends InferOutput<typeof buttonSchema> {}
