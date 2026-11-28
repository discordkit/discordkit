import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { schema } from "@discordkit/core/validations/schema";
import { ComponentType } from "./ComponentType.js";

const _textDisplaySchema = v.object({
  /** `10` for text display */
  type: v.literal(ComponentType.TextDisplay),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** Text that will be displayed similar to a message; max 4000 characters */
  content: v.pipe(
    v.string(),
    v.maxLength(
      4000,
      (issue) =>
        `Expected a text display of at most 4000 characters, received: ${issue.received} characters. Discord limits each text display, and all the text displays in a message or modal together, to 4000 characters. Shorten the text, or split it across more than one message.`
    )
  ) as v.GenericSchema<string>
});

export interface TextDisplay extends v.InferOutput<typeof _textDisplaySchema> {}

/**
 * ### [Text Display](https://discord.com/developers/docs/components/reference#text-display)
 *
 * A Text Display is a top-level content component that allows you to add text to your message formatted with markdown and mention users and roles. This is similar to the `content` field of a message, but allows you to add multiple text components, controlling the layout of your message.
 *
 * Text Displays are only available in messages.
 *
 * > [!NOTE]
 * >
 * > To use this component, you need to send the message flag `1 << 15` (IS_COMPONENTS_V2) which can be activated on a per-message basis.
 */
export const textDisplaySchema = schema<TextDisplay>(_textDisplaySchema);
