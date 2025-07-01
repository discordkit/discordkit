import * as v from "valibot";
import { ComponentType } from "./ComponentType.js";

/**
 * A Text Display is a top-level content component that allows you to add text to your message formatted with markdown and mention users and roles. This is similar to the `content` field of a message, but allows you to add multiple text components, controlling the layout of your message.
 *
 * Text Displays are only available in messages.
 *
 * > [!NOTE]
 * >
 * > To use this component, you need to send the message flag `1 << 15` (IS_COMPONENTS_V2) which can be activated on a per-message basis.
 */
export const textDisplaySchema = v.object({
  /** `10` for text display */
  type: v.literal(ComponentType.TextDisplay),
  /** Optional identifier for component */
  id: v.exactOptional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(Number.MAX_SAFE_INTEGER)
    )
  ),
  /** Text that will be displayed similar to a message */
  content: v.string()
});

export interface TextDisplay extends v.InferOutput<typeof textDisplaySchema> {}
