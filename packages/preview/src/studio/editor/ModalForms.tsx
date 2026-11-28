import type { ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { TextInputStyle } from "@discordkit/client/components/types/TextInputStyle";
import { componentName, supportedComponents } from "../../components.js";
import {
  maxFileTypes,
  maxGroupOptions,
  maxGroupValues,
  maxLabel,
  maxLabelDescription,
  maxModalTitle,
  maxTextInputLength,
  maxTextInputPlaceholder
} from "../../lint/limits.js";
import { QuietButton } from "../controls/Buttons.js";
import { newChild, setValueAt } from "./edits.js";
import { useEditor } from "./EditorContext.js";
import {
  ChoiceControl,
  ListChoice,
  NumberControl,
  SwitchControl,
  TextAreaControl,
  TextControl,
  useSceneValue
} from "./fields.js";
import { ItemList } from "./ItemList.js";
import { parsePathKey } from "./paths.js";
import styles from "./Form.module.css";

/**
 * The forms for a modal and what it holds. Each takes the selected node's path as its field-name prefix, as the message forms do, so a finding lands on its field. What a person has typed into the modal (`modal.values`, keyed by field ids that are not field names) is left to the JSON pane; whether Submit has been pressed is a switch on the modal's form.
 */

const at = (prefix: string, key: string): string => `${prefix}.${key}`;

const requiredHelp = `Discord's default is required. Turn it off to let the modal be submitted without an answer.`;

/** The modal itself: its title, its id, and whether to draw it as after Submit. */
export const ModalForm = (): ReactElement => {
  const { apply, disabledReason } = useEditor();
  return (
    <>
      <TextControl
        name="modal.payload.title"
        label="Title"
        help={`On one line above the fields. Up to ${String(maxModalTitle)} characters.`}
      />
      <TextControl
        name="modal.payload.customId"
        label="Custom id"
        code
        help="Sent to your app with the answers when the modal is submitted. Up to 100 characters."
      />
      <SwitchControl
        name="modal.submitted"
        label="Show after Submit"
        help="Preview only: draws the errors the client shows under each required field left empty and each text that is too short. What has been typed in is the scene's modal.values, in the JSON pane."
      />
      <QuietButton
        isDisabled={disabledReason !== undefined}
        onPress={() => {
          apply(
            (scene) => setValueAt(scene, [`modal`], undefined, [`messages`, 0]),
            `Remove the modal`
          );
        }}
      >
        Remove the modal
      </QuietButton>
    </>
  );
};

/** What a Label can hold, for the choice of its field's kind. */
const fieldKinds = supportedComponents.label.map((type) => ({
  id: type,
  label: componentName(type)
}));

/** A Label: its title and description, and which kind of field it holds. Changing the kind replaces the field with a new one of that kind. */
export const LabelForm = ({ name }: { name: string }): ReactElement => {
  const { apply, disabledReason } = useEditor();
  const kind = useSceneValue(at(name, `component.type`));
  return (
    <>
      <TextControl
        name={at(name, `label`)}
        label="Label"
        help={`The field's title. Up to ${String(maxLabel)} characters.`}
      />
      <TextControl
        name={at(name, `description`)}
        label="Description"
        optional
        help={`Under the title on desktop. Up to ${String(maxLabelDescription)} characters.`}
      />
      <ListChoice
        label="Field"
        fieldPath={at(name, `component.type`)}
        value={fieldKinds.find((option) => option.id === kind)?.id}
        options={fieldKinds}
        isDisabled={disabledReason !== undefined}
        onChange={(next) => {
          const path = [...parsePathKey(name), `component`];
          apply((scene) =>
            setValueAt(scene, path, newChild(scene, next), path)
          );
        }}
      />
    </>
  );
};

const customId = (name: string): ReactElement => (
  <TextControl
    name={at(name, `customId`)}
    label="Custom id"
    code
    help="Sent to your app with the answer. Unique in the modal, up to 100 characters."
  />
);

const textStyles = [
  { id: TextInputStyle.Short, label: `Short`, detail: `One line` },
  { id: TextInputStyle.Paragraph, label: `Paragraph`, detail: `Several lines` }
];

/** A Text Input, in a Label or (the older form) in an action row with its own label. */
export const TextInputForm = ({ name }: { name: string }): ReactElement => {
  const inRow = parsePathKey(name).at(-2) === `components`;
  return (
    <>
      {customId(name)}
      <ChoiceControl
        name={at(name, `style`)}
        label="Style"
        options={textStyles}
      />
      {inRow ? (
        <TextControl
          name={at(name, `label`)}
          label="Label"
          help={`The field's title, in this older form. Up to ${String(maxLabel)} characters.`}
        />
      ) : null}
      <TextControl
        name={at(name, `placeholder`)}
        label="Placeholder"
        optional
        help={`Shown while the field is empty. Up to ${String(maxTextInputPlaceholder)} characters.`}
      />
      <TextAreaControl
        name={at(name, `value`)}
        label="Pre-filled value"
        optional
        rows={3}
        help="What the field holds when the modal opens."
      />
      <div className={styles.row}>
        <NumberControl
          name={at(name, `minLength`)}
          label="Shortest"
          minValue={0}
          maxValue={maxTextInputLength}
          placeholder="0"
        />
        <NumberControl
          name={at(name, `maxLength`)}
          label="Longest"
          minValue={1}
          maxValue={maxTextInputLength}
          placeholder="4000"
        />
      </div>
      <SwitchControl
        name={at(name, `required`)}
        label="Required"
        defaultValue
        help={requiredHelp}
      />
    </>
  );
};

const valueRange = (name: string, what: string): ReactElement => (
  <div className={styles.row}>
    <NumberControl
      name={at(name, `minValues`)}
      label={`Fewest ${what}`}
      minValue={0}
      maxValue={maxGroupValues}
      placeholder="1"
    />
    <NumberControl
      name={at(name, `maxValues`)}
      label={`Most ${what}`}
      minValue={1}
      maxValue={maxGroupValues}
    />
  </div>
);

/** A File Upload. */
export const FileUploadForm = ({ name }: { name: string }): ReactElement => (
  <>
    {customId(name)}
    {valueRange(name, `files`)}
    <SwitchControl
      name={at(name, `required`)}
      label="Required"
      defaultValue
      help={requiredHelp}
    />
    <ItemList
      name={at(name, `fileTypes`)}
      label="File types"
      itemLabel={(index) => `Type ${String(index + 1)}`}
      addLabel="Add file type"
      max={maxFileTypes}
      newItem={() => `.pdf`}
    >
      {(item) => (
        <TextControl
          name={item}
          label="Type"
          code
          help="image, video, audio, or an extension with its dot, such as .pdf."
        />
      )}
    </ItemList>
  </>
);

/** A Radio Group or a Checkbox Group: their options, and for a checkbox group how many may be ticked. */
export const GroupForm = ({
  name,
  type
}: {
  name: string;
  type: ComponentType;
}): ReactElement => (
  <>
    {customId(name)}
    {type === ComponentType.CheckboxGroup ? valueRange(name, `ticks`) : null}
    <SwitchControl
      name={at(name, `required`)}
      label="Required"
      defaultValue
      help={requiredHelp}
    />
    <ItemList
      name={at(name, `options`)}
      label="Options"
      itemLabel={(index) => `Option ${String(index + 1)}`}
      addLabel="Add option"
      max={maxGroupOptions}
      newItem={() => ({ label: `Option`, value: `option` })}
    >
      {(option) => (
        <>
          <div className={styles.row}>
            <TextControl name={at(option, `label`)} label="Label" />
            <TextControl name={at(option, `value`)} label="Value" code />
          </div>
          <TextControl
            name={at(option, `description`)}
            label="Description"
            optional
          />
          <SwitchControl
            name={at(option, `default`)}
            label={
              type === ComponentType.RadioGroup
                ? `Chosen by default`
                : `Ticked by default`
            }
          />
        </>
      )}
    </ItemList>
  </>
);

/** A Checkbox: its id and whether it starts ticked. It has no `required`. */
export const CheckboxForm = ({ name }: { name: string }): ReactElement => (
  <>
    {customId(name)}
    <SwitchControl name={at(name, `default`)} label="Ticked by default" />
  </>
);
