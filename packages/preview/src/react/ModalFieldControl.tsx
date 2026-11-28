import type { ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Label } from "@discordkit/client/components/types/Label";
import { TextInputStyle } from "@discordkit/client/components/types/TextInputStyle";
import type { ModalValue } from "../scene.js";
import { CheckboxGroup } from "./CheckboxGroup.js";
import { FileUpload } from "./FileUpload.js";
import { ModalSelect } from "./ModalSelect.js";
import { ParagraphTextInput } from "./ParagraphTextInput.js";
import { RadioGroup } from "./RadioGroup.js";
import { ShortTextInput } from "./ShortTextInput.js";
import { unsupportedComponent } from "./unsupportedComponent.js";

export interface ModalFieldControlProps {
  /** The component a Label wraps. */
  field: Label[`component`];
  /** What the scene says has been filled in, already checked to be the right kind for the field. */
  value: ModalValue | undefined;
}

/** The control a Label wraps, drawn by the component for its type. A Checkbox is drawn by its Label (`CheckboxField`), so it never reaches here. */
export const ModalFieldControl = ({
  field,
  value
}: ModalFieldControlProps): ReactElement => {
  switch (field.type) {
    case ComponentType.TextInput:
      return field.style === TextInputStyle.Paragraph ? (
        <ParagraphTextInput
          input={field}
          text={typeof value === `string` ? value : undefined}
        />
      ) : (
        <ShortTextInput
          input={field}
          text={typeof value === `string` ? value : undefined}
        />
      );
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return (
        <ModalSelect
          select={field}
          chosen={Array.isArray(value) ? value : undefined}
        />
      );
    case ComponentType.FileUpload:
      return (
        <FileUpload
          upload={field}
          files={Array.isArray(value) ? value : undefined}
        />
      );
    case ComponentType.RadioGroup:
      return (
        <RadioGroup
          group={field}
          chosen={typeof value === `string` ? value : undefined}
        />
      );
    case ComponentType.CheckboxGroup:
      return (
        <CheckboxGroup
          group={field}
          ticked={Array.isArray(value) ? value : undefined}
        />
      );
    case ComponentType.Checkbox:
    default:
      throw unsupportedComponent(field.type, `a Label`);
  }
};
