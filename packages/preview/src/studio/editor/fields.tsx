import { useId, type ReactElement, type ReactNode } from "react";
import { get, useController, useFormState, useWatch } from "react-hook-form";
import {
  Button,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorThumb,
  Dialog,
  DialogTrigger,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  NumberField,
  Popover,
  Select,
  SelectValue,
  SliderTrack,
  SwitchButton,
  SwitchField,
  Text,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  type Color,
  type Key
} from "react-aria-components";
import { ChevronIcon, ErrorIcon, WarningIcon } from "../controls/icons.js";
import controls from "../controls/Fields.module.css";
import { colorToHexOrUndefined, hexToColor } from "./color.js";
import { unknownAt } from "./contextUsage.js";
import { useEditor } from "./EditorContext.js";
import { UnknownNotes } from "./UnknownNotes.js";
import { fieldPath } from "./paths.js";
import { optionalText } from "./prune.js";
import styles from "./Form.module.css";

/**
 * The structured editor's fields, each a react-aria-components control bound to one scene path in the form.
 *
 * Every change is applied to the form at once and written to the file (the write is debounced further down, in the document), so the preview follows each keystroke. A field shows lint's findings for its path under it, read from the form's error state, which the resolver fills from `lint`: the same finding the command line reports, in the place it is about.
 *
 * An optional field that is cleared is set to `undefined`, never to an empty string, so its key leaves the payload (see `prune.ts`). A switch or choice set back to Discord's default does the same, so a payload says only what differs from Discord's defaults.
 */

interface FindingError {
  type?: string;
  message?: string;
  types?: Record<string, unknown>;
}

/** An entry of the form's error state as the lint resolver writes it, or undefined for anything else. */
const asFindingError = (value: unknown): FindingError | undefined =>
  typeof value === `object` && value !== null ? value : undefined;

const messagesOf = (error: FindingError | undefined): string[] => {
  if (error === undefined) return [];
  const all = Object.values(error.types ?? {}).filter(
    (message): message is string => typeof message === `string`
  );
  return all.length > 0
    ? all
    : error.message === undefined
      ? []
      : [error.message];
};

/** A finding's message, with its `code` spans drawn as code, as lint writes them. */
const FindingText = ({ text }: { text: string }): ReactElement => (
  <>
    {text.split(`\``).map((part, index) =>
      index % 2 === 1 ? (
        // oxlint-disable-next-line react/no-array-index-key -- the parts of one fixed string, in order.
        <code key={index} className={styles.inlineCode}>
          {part}
        </code>
      ) : (
        part
      )
    )}
  </>
);

/** Lint's findings for one path, as a list under the field. */
export const Findings = ({
  error
}: {
  error: FindingError | undefined;
}): ReactElement | null => {
  const messages = messagesOf(error);
  if (messages.length === 0) return null;
  const isError = error?.type === `error`;
  return (
    <ul className={isError ? styles.findingsError : styles.findingsWarning}>
      {messages.map((message) => (
        <li key={message} className={styles.finding}>
          {isError ? (
            <ErrorIcon className={styles.findingIcon} />
          ) : (
            <WarningIcon className={styles.findingIcon} />
          )}
          <span className={styles.visuallyHidden}>
            {isError ? `Error:` : `Warning:`}
          </span>
          <span>
            <FindingText text={message} />
          </span>
        </li>
      ))}
    </ul>
  );
};

/** The value at a scene path, re-rendering when it changes. Unknown to the caller, who checks it: a form decides what it shows from what is actually there. */
export const useSceneValue = (name: string): unknown => {
  const { control } = useEditor();
  return useWatch({ control, name: fieldPath(name) });
};

/** The findings on an object or list (a component, its options), which lint files under the path's `root`. */
export const ObjectFindings = ({
  name
}: {
  name: string;
}): ReactElement | null => {
  const { control } = useEditor();
  const { errors } = useFormState({ control, name: fieldPath(name) });
  return <Findings error={asFindingError(get(errors, `${name}.root`))} />;
};

/** A field's help line, its findings, and what its text uses that the scene does not describe (each with the action that starts describing it), in the one element its control is described by. */
const Description = ({
  help,
  error,
  name
}: {
  help: ReactNode | undefined;
  error: FindingError | undefined;
  /** The field's scene path, when its text can mention users, roles, channels or emoji. */
  name?: string;
}): ReactElement | null => {
  const { report } = useEditor();
  const unknown = name === undefined ? 0 : unknownAt(report, name).length;
  return help === undefined &&
    messagesOf(error).length === 0 &&
    unknown === 0 ? null : (
    <Text slot="description" className={styles.description}>
      {help === undefined ? null : <span className={styles.help}>{help}</span>}
      <Findings error={error} />
      {name === undefined || unknown === 0 ? null : (
        <UnknownNotes name={name} />
      )}
    </Text>
  );
};

interface BoundProps {
  /** The scene path of the value, as a field name. */
  name: string;
  label: string;
  /** A line under the label: what the field is for, what Discord does with it. */
  help?: ReactNode;
}

interface Bound {
  value: unknown;
  onBlur: () => void;
  /** Gives the form the element to focus for a finding. */
  attach: ReturnType<typeof useController>[`field`][`ref`];
  error: FindingError | undefined;
  isError: boolean;
  isDisabled: boolean;
  /** Sets the value and writes the scene. */
  /** `step` names the change in the history, when "Edit <label>" does not say it. */
  commit: (value: unknown, step?: string) => void;
}

/** A field bound to its scene path. `label` names its edits in the history; typing in one field is one step until it pauses. */
const useBound = (name: string, label: string): Bound => {
  const editor = useEditor();
  const { field, fieldState } = useController({
    control: editor.control,
    name: fieldPath(name)
  });
  const error: FindingError | undefined = fieldState.error;
  return {
    value: field.value,
    onBlur: field.onBlur,
    attach: field.ref,
    error,
    isError: error?.type === `error`,
    isDisabled: editor.disabledReason !== undefined,
    commit: (value: unknown, step = `Edit ${label}`): void => {
      field.onChange(value);
      editor.write({ label: step, group: name });
    }
  };
};

/** One line of text: a label, a custom id, a URL. */
export const TextControl = ({
  name,
  label,
  help,
  optional = false,
  code = false,
  placeholder
}: BoundProps & {
  /** Clearing it removes the key, rather than leaving an empty string Discord would refuse. */
  optional?: boolean;
  /** Set in the code font: ids and URLs, where every character matters. */
  code?: boolean;
  placeholder?: string;
}): ReactElement => {
  const { value, onBlur, attach, error, isError, isDisabled, commit } =
    useBound(name, label);
  return (
    <TextField
      className={styles.field}
      data-field-path={name}
      value={typeof value === `string` ? value : ``}
      onChange={(text) => commit(optional ? optionalText(text) : text)}
      onBlur={onBlur}
      isDisabled={isDisabled}
      isInvalid={isError}
    >
      <Label className={styles.label}>{label}</Label>
      <Input
        ref={attach}
        className={code ? `${controls.input} ${controls.code}` : controls.input}
        placeholder={placeholder}
        spellCheck={!code}
        autoComplete="off"
      />
      <Description help={help} error={error} name={name} />
    </TextField>
  );
};

/** Text that can run to several lines: where people write markdown. */
export const TextAreaControl = ({
  name,
  label,
  help,
  optional = false,
  rows = 4
}: BoundProps & { optional?: boolean; rows?: number }): ReactElement => {
  const { value, onBlur, attach, error, isError, isDisabled, commit } =
    useBound(name, label);
  return (
    <TextField
      className={styles.field}
      data-field-path={name}
      value={typeof value === `string` ? value : ``}
      onChange={(text) => commit(optional ? optionalText(text) : text)}
      onBlur={onBlur}
      isDisabled={isDisabled}
      isInvalid={isError}
    >
      <Label className={styles.label}>{label}</Label>
      <TextArea
        ref={attach}
        className={styles.textarea}
        rows={rows}
        // The smallest it shrinks to while it grows with its text.
        style={{
          minHeight: `calc(${String(rows)}lh + 2 * var(--st-space-3) + 2px)`
        }}
        spellCheck
      />
      <Description help={help} error={error} name={name} />
    </TextField>
  );
};

/** A whole number. Clearing an optional one removes it. */
export const NumberControl = ({
  name,
  label,
  help,
  minValue,
  maxValue,
  placeholder
}: BoundProps & {
  minValue?: number;
  maxValue?: number;
  /** Shown while empty: Discord's default. */
  placeholder?: string;
}): ReactElement => {
  const { value, onBlur, attach, error, isError, isDisabled, commit } =
    useBound(name, label);
  return (
    <NumberField
      className={styles.field}
      data-field-path={name}
      value={typeof value === `number` ? value : Number.NaN}
      onChange={(value) => commit(Number.isNaN(value) ? undefined : value)}
      onBlur={onBlur}
      minValue={minValue}
      maxValue={maxValue}
      step={1}
      formatOptions={{ useGrouping: false, maximumFractionDigits: 0 }}
      isDisabled={isDisabled}
      isInvalid={isError}
    >
      <Label className={styles.label}>{label}</Label>
      <Input
        ref={attach}
        className={`${controls.input} ${styles.number}`}
        placeholder={placeholder}
      />
      <Description help={help} error={error} />
    </NumberField>
  );
};

/** On or off. Set back to Discord's default, the key is removed. */
export const SwitchControl = ({
  name,
  label,
  help,
  defaultValue = false
}: BoundProps & {
  /** What Discord takes the field to be when it is absent. */
  defaultValue?: boolean;
}): ReactElement => {
  const { value, attach, error, isDisabled, commit } = useBound(name, label);
  const isSelected = typeof value === `boolean` ? value : defaultValue;
  return (
    <div className={styles.field} data-field-path={name}>
      <SwitchField
        isSelected={isSelected}
        onChange={(next) =>
          commit(
            next === defaultValue ? undefined : next,
            `Turn ${label} ${next ? `on` : `off`}`
          )
        }
        isDisabled={isDisabled}
        inputRef={attach}
      >
        <SwitchButton className={controls.switch}>
          <span className={controls.track} />
          {label}
        </SwitchButton>
      </SwitchField>
      {help === undefined ? null : <p className={styles.help}>{help}</p>}
      <Findings error={error} />
    </div>
  );
};

export interface Choice<T extends string | number> {
  id: T;
  label: string;
}

/** One of a few, all in view: a separator's spacing, a message's kind. Choosing Discord's default removes the key. */
export const ChoiceControl = <T extends string | number>({
  name,
  label,
  help,
  options,
  defaultValue
}: BoundProps & {
  options: ReadonlyArray<Choice<T>>;
  /** What Discord takes the field to be when it is absent. */
  defaultValue?: T;
}): ReactElement => {
  const { value, error, isDisabled, commit } = useBound(name, label);
  const labelId = useId();
  const current: unknown = value ?? defaultValue;
  return (
    <div className={styles.field} data-field-path={name}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <ToggleButtonGroup
        aria-labelledby={labelId}
        className={controls.segments}
        selectionMode="single"
        disallowEmptySelection
        isDisabled={isDisabled}
        selectedKeys={
          options.some((option) => option.id === current)
            ? [String(current)]
            : []
        }
        onSelectionChange={(keys) => {
          const [key] = [...keys];
          const option = options.find(
            (candidate) => String(candidate.id) === key
          );
          if (option !== undefined) {
            commit(option.id === defaultValue ? undefined : option.id);
          }
        }}
      >
        {options.map((option) => (
          <ToggleButton
            key={option.id}
            id={String(option.id)}
            className={controls.segment}
          >
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {help === undefined ? null : <p className={styles.help}>{help}</p>}
      <Findings error={error} />
    </div>
  );
};

/** One choice from a list, unbound: the form decides what choosing does. */
export const ListChoice = <T extends string | number>({
  label,
  value,
  options,
  onChange,
  isDisabled,
  help,
  error,
  fieldPath
}: {
  label: string;
  value: T | undefined;
  options: ReadonlyArray<Choice<T> & { detail?: string }>;
  onChange: (value: T) => void;
  isDisabled?: boolean;
  help?: ReactNode;
  error?: FindingError;
  fieldPath?: string;
}): ReactElement => (
  <Select
    className={styles.field}
    data-field-path={fieldPath}
    value={value === undefined ? null : String(value)}
    onChange={(key: Key | null) => {
      const option = options.find((candidate) => String(candidate.id) === key);
      if (option !== undefined) onChange(option.id);
    }}
    isDisabled={isDisabled}
    isInvalid={error?.type === `error`}
  >
    <Label className={styles.label}>{label}</Label>
    <Button className={controls.selectButton}>
      {/* The chosen option's label alone, not its detail line. */}
      <SelectValue className={controls.selectValue}>
        {({ selectedText }) => selectedText}
      </SelectValue>
      <ChevronIcon className={controls.chevron} />
    </Button>
    <Description help={help} error={error} name={fieldPath} />
    <Popover className={controls.popover} placement="bottom start">
      <ListBox
        className={controls.listBox}
        items={options.map((option) => ({ ...option, key: String(option.id) }))}
      >
        {(option) => (
          <ListBoxItem
            id={option.key}
            textValue={option.label}
            className={controls.option}
          >
            {/* As slots, so the closed select shows the label alone and the list reads the detail as the option's description. */}
            <Text slot="label">{option.label}</Text>
            {option.detail === undefined ? null : (
              <Text slot="description" className={controls.optionDetail}>
                {option.detail}
              </Text>
            )}
          </ListBoxItem>
        )}
      </ListBox>
    </Popover>
  </Select>
);

/** A colour Discord stores as an integer, shown and typed as hex, with a picker and a way to clear it. */
export const ColorControl = ({
  name,
  label,
  help
}: BoundProps): ReactElement => {
  const { value, attach, error, isError, isDisabled, commit } = useBound(
    name,
    label
  );
  const labelId = useId();
  const hex = colorToHexOrUndefined(
    typeof value === `number` ? value : undefined
  );
  const fromColor = (color: Color | null): void =>
    commit(color === null ? undefined : hexToColor(color.toString(`hex`)));
  return (
    <div className={styles.field} data-field-path={name}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.colorRow}>
        <ColorPicker value={hex ?? `#5865f2`} onChange={fromColor}>
          <DialogTrigger>
            <Button
              className={styles.swatchButton}
              aria-label={`Pick ${label.toLowerCase()}`}
              isDisabled={isDisabled}
            >
              <span
                className={
                  hex === undefined ? styles.swatchNone : styles.swatch
                }
                style={hex === undefined ? undefined : { background: hex }}
              />
            </Button>
            <Popover className={styles.colorPopover} placement="bottom start">
              <Dialog className={styles.colorDialog} aria-label={label}>
                <ColorArea
                  className={styles.colorArea}
                  colorSpace="hsb"
                  xChannel="saturation"
                  yChannel="brightness"
                >
                  <ColorThumb className={styles.colorThumb} />
                </ColorArea>
                <ColorSlider
                  className={styles.colorSlider}
                  colorSpace="hsb"
                  channel="hue"
                  aria-label="Hue"
                >
                  <SliderTrack className={styles.colorTrack}>
                    <ColorThumb className={styles.colorThumb} />
                  </SliderTrack>
                </ColorSlider>
              </Dialog>
            </Popover>
          </DialogTrigger>
        </ColorPicker>
        <ColorField
          className={styles.colorField}
          aria-labelledby={labelId}
          value={hex ?? null}
          onChange={fromColor}
          isDisabled={isDisabled}
          isInvalid={isError}
        >
          <Input
            ref={attach}
            className={`${controls.input} ${controls.code}`}
            placeholder="None"
          />
        </ColorField>
        <Button
          className={styles.quietButton}
          onPress={() => commit(undefined)}
          isDisabled={isDisabled || hex === undefined}
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          Clear
        </Button>
      </div>
      {help === undefined ? null : <p className={styles.help}>{help}</p>}
      <Findings error={error} />
    </div>
  );
};

interface EmojiValue {
  id?: string | null;
  name?: string | null;
  animated?: boolean;
}

/**
 * A button's or option's emoji: a Unicode emoji, or a server's custom emoji by its id and name. Written as Discord's partial emoji, `{ id: null, name: "🔥" }` for Unicode (the client's schema requires the `id` key) and `{ id, name }` for a custom one; cleared, the key is removed.
 */
export const EmojiControl = ({
  name,
  label
}: {
  name: string;
  label: string;
}): ReactElement => {
  const {
    value: bound,
    attach,
    error,
    isDisabled,
    commit
  } = useBound(name, label);
  const value: EmojiValue =
    typeof bound === `object` && bound !== null ? bound : {};
  const update = (next: EmojiValue): void => {
    const emojiName = next.name ?? ``;
    const id = next.id ?? ``;
    if (emojiName === `` && id === ``) {
      commit(undefined);
      return;
    }
    commit({
      id: id === `` ? null : id,
      name: emojiName === `` ? null : emojiName,
      ...(next.animated === true && id !== `` ? { animated: true } : {})
    });
  };
  return (
    <fieldset className={styles.group} data-field-path={name}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.row}>
        <TextField
          className={styles.field}
          value={value.name ?? ``}
          onChange={(text) => update({ ...value, name: text })}
          isDisabled={isDisabled}
        >
          <Label className={styles.label}>Emoji or name</Label>
          <Input ref={attach} className={controls.input} autoComplete="off" />
        </TextField>
        <TextField
          className={styles.field}
          value={value.id ?? ``}
          onChange={(text) => update({ ...value, id: text })}
          isDisabled={isDisabled}
        >
          <Label className={styles.label}>Custom emoji id</Label>
          <Input
            className={`${controls.input} ${controls.code}`}
            autoComplete="off"
            placeholder="None (Unicode)"
          />
        </TextField>
      </div>
      <Findings error={error} />
    </fieldset>
  );
};
