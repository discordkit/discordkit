import type { ReactElement } from "react";
import type { ActionRow } from "@discordkit/client/components/types/ActionRow";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { TextInputStyle } from "@discordkit/client/components/types/TextInputStyle";
import { fieldCount, fieldProblem, fieldValue } from "../modal.js";
import { FieldFrame } from "./FieldFrame.js";
import { useInspect } from "./Inspect.js";
import { useModalState } from "./ModalContext.js";
import { ParagraphTextInput } from "./ParagraphTextInput.js";
import { ShortTextInput } from "./ShortTextInput.js";
import { unsupportedComponent } from "./unsupportedComponent.js";

export interface LegacyTextInputRowProps {
  component: ActionRow;
}

/**
 * The older form of a modal's field, which Discord now calls deprecated but still accepts: an Action Row holding one Text Input, whose own `label` is the field's title. Drawn as a Label would draw the same input, which is what the client is believed to do; no screenshot shows one.
 */
export const LegacyTextInputRow = ({
  component
}: LegacyTextInputRowProps): ReactElement => {
  const { values, submitted } = useModalState();
  const inspect = useInspect(component);
  // Discord sends and expects an array; the client's schema has a text input here as a bare object (see `ActionRow.tsx`).
  const children = Array.isArray(component.components)
    ? component.components
    : [component.components];
  return (
    <div {...inspect}>
      {children.map((input, index) => {
        if (input.type !== ComponentType.TextInput) {
          throw unsupportedComponent(input.type, `a modal's Action Row`);
        }
        const value = fieldValue(values, input);
        const text = typeof value === `string` ? value : undefined;
        const problem = submitted
          ? fieldProblem(input, fieldCount(input, value))
          : null;
        return (
          <FieldFrame
            // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity.
            key={index}
            component={input}
            title={input.label}
            required={input.required !== false}
            problem={problem}
            noun="characters"
          >
            {input.style === TextInputStyle.Paragraph ? (
              <ParagraphTextInput input={input} text={text} />
            ) : (
              <ShortTextInput input={input} text={text} />
            )}
          </FieldFrame>
        );
      })}
    </div>
  );
};
