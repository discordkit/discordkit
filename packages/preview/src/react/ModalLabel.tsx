import type { ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Label } from "@discordkit/client/components/types/Label";
import {
  fieldCount,
  fieldProblem,
  fieldValue,
  type FieldLike
} from "../modal.js";
import { CheckboxField } from "./CheckboxField.js";
import { FieldFrame, type FieldFrameProps } from "./FieldFrame.js";
import { ModalFieldControl } from "./ModalFieldControl.js";
import { useModalState } from "./ModalContext.js";

export interface ModalLabelProps {
  component: Label;
}

/** What a field's error talks about, for its wording. */
const nounFor = (type: ComponentType): FieldFrameProps[`noun`] =>
  type === ComponentType.TextInput
    ? `characters`
    : type === ComponentType.FileUpload
      ? `files`
      : `choices`;

/**
 * A Label: the title and description of one field, and the field. A Checkbox is drawn the way the client draws one, with the title beside the box rather than above it (`CheckboxField`).
 */
export const ModalLabel = ({ component }: ModalLabelProps): ReactElement => {
  const { values, submitted } = useModalState();
  const field = component.component;
  const value = fieldValue(values, field);
  if (field.type === ComponentType.Checkbox) {
    return (
      <CheckboxField
        label={component}
        checkbox={field}
        ticked={value === undefined ? field.default === true : value === true}
      />
    );
  }
  // Every field but a checkbox has `required`, defaulting to true; the client's schema types leave it off the selects, which accept it in a modal.
  const read: FieldLike = field;
  const problem = submitted
    ? fieldProblem(read, fieldCount(read, value))
    : null;
  return (
    <FieldFrame
      component={component}
      title={component.label}
      description={component.description}
      required={read.required !== false}
      problem={problem}
      noun={nounFor(field.type)}
    >
      <ModalFieldControl field={field} value={value} />
    </FieldFrame>
  );
};
