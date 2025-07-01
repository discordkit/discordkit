import * as v from "valibot";
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
export const buttonSchema = v.object({
  /** `2` for a button */
  type: v.literal(ComponentType.Button),
  /** Optional identifier for component */
  id: v.exactOptional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(Number.MAX_SAFE_INTEGER)
    )
  ),
  /** A button style */
  style: buttonStyleSchema,
  /** Text that appears on the button; max 80 characters */
  label: v.exactOptional(v.pipe(v.string(), v.nonEmpty(), v.maxLength(80))),
  /** `name`, `id`, and `animated` */
  emoji: v.exactOptional(v.pick(emojiSchema, [`id`, `name`, `animated`])),
  /** Developer-defined identifier for the button; max 100 characters */
  customId: v.exactOptional(v.pipe(v.string(), v.nonEmpty(), v.maxLength(100))),
  /** Identifier for a purchasable SKU, only available when using premium-style buttons */
  skuId: v.exactOptional(snowflake),
  /** URL for link-style buttons */
  url: v.exactOptional(v.pipe(v.string(), v.url())),
  /** Whether the button is disabled (defaults to `false`) */
  disabled: v.exactOptional(v.boolean())
});

export interface Button extends v.InferOutput<typeof buttonSchema> {}
