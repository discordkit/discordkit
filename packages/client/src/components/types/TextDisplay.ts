import {
  exactOptional,
  integer,
  literal,
  maxValue,
  minValue,
  number,
  object,
  pipe,
  string,
  type InferOutput
} from "valibot";
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
export const textDisplaySchema = object({
  /** `10` for text display */
  type: literal(ComponentType.TextDisplay),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** Text that will be displayed similar to a message */
  content: string()
});

export type TextDisplay = InferOutput<typeof textDisplaySchema>;
