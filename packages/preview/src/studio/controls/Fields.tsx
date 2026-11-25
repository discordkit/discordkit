import { useId, useState, type ReactElement } from "react";
import {
  Button,
  ComboBox,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  NumberField,
  Popover,
  Select,
  SelectValue,
  SwitchButton,
  SwitchField,
  Text,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  type Key
} from "react-aria-components";
import { ChevronIcon } from "./icons.js";
import styles from "./Fields.module.css";

/**
 * Studio's form controls, each a react-aria-components control with a visible label. They are controlled, and the text ones commit on Enter or when focus leaves rather than on every keystroke, because each commit can write the scene file: a half-typed locale should neither redraw the preview as broken nor reach the disk.
 */

export interface Option<T extends string> {
  id: T;
  label: string;
  /** A second line in a list, such as where a select sits in the message. */
  detail?: string;
}

interface CommonProps {
  label: string;
  isDisabled?: boolean;
  /** A problem with the current value, such as a lint finding on this field. */
  error?: string;
}

const ErrorText = ({ error }: { error?: string }): ReactElement | null =>
  error === undefined ? null : (
    <Text slot="errorMessage" className={styles.error}>
      {error}
    </Text>
  );

/** One choice from a few, all visible: theme, a width preset. */
export const SegmentedField = <T extends string>({
  label,
  value,
  options,
  onChange,
  isDisabled
}: CommonProps & {
  value: T | undefined;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
}): ReactElement => {
  const labelId = useId();
  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <ToggleButtonGroup
        aria-labelledby={labelId}
        className={styles.segments}
        selectionMode="single"
        disallowEmptySelection
        isDisabled={isDisabled}
        selectedKeys={value === undefined ? [] : [value]}
        onSelectionChange={(keys) => {
          const [key] = [...keys];
          const option = options.find((candidate) => candidate.id === key);
          if (option !== undefined) onChange(option.id);
        }}
      >
        {options.map((option) => (
          <ToggleButton
            key={option.id}
            id={option.id}
            className={styles.segment}
          >
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
};

/** A whole number, committed on Enter or blur. Arrow keys step it. */
export const NumberInputField = ({
  label,
  value,
  onChange,
  minValue,
  maxValue,
  isDisabled,
  error,
  width
}: CommonProps & {
  value: number;
  onChange: (value: number) => void;
  minValue: number;
  maxValue: number;
  /** The field's width in characters. */
  width?: number;
}): ReactElement => (
  <NumberField
    className={styles.field}
    value={value}
    onChange={(next) => {
      if (Number.isFinite(next)) onChange(next);
    }}
    minValue={minValue}
    maxValue={maxValue}
    step={1}
    formatOptions={{ useGrouping: false, maximumFractionDigits: 0 }}
    isDisabled={isDisabled}
    isInvalid={error !== undefined}
    style={
      width === undefined ? undefined : { width: `${String(width + 3)}ch` }
    }
  >
    <Label className={styles.label}>{label}</Label>
    <Input className={styles.input} />
    <ErrorText error={error} />
  </NumberField>
);

/** Commit-on-blur text state: what is typed, reset whenever the value changes from outside. */
const useDraft = (value: string): [string, (next: string) => void] => {
  const [draft, setDraft] = useState(value);
  // Adjusting state while rendering when a prop changes, as React recommends over an effect.
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    setDraft(value);
  }
  return [draft, setDraft];
};

/** Free text, committed on Enter or blur. */
export const TextInputField = ({
  label,
  value,
  onCommit,
  isDisabled,
  error,
  placeholder,
  width
}: CommonProps & {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  width?: number;
}): ReactElement => {
  const [draft, setDraft] = useDraft(value);
  const commit = (): void => {
    if (draft !== value) onCommit(draft);
  };
  return (
    <TextField
      className={styles.field}
      value={draft}
      onChange={setDraft}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === `Enter`) commit();
        if (event.key === `Escape`) setDraft(value);
      }}
      isDisabled={isDisabled}
      isInvalid={error !== undefined}
      style={width === undefined ? undefined : { width: `${String(width)}ch` }}
    >
      <Label className={styles.label}>{label}</Label>
      <Input
        className={`${styles.input} ${styles.code}`}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
      />
      <ErrorText error={error} />
    </TextField>
  );
};

/** Free text with suggestions, such as a locale or a time zone. Committed when a suggestion is chosen, or on Enter or blur. */
export const ComboField = ({
  label,
  value,
  options,
  onCommit,
  isDisabled,
  error,
  width
}: CommonProps & {
  value: string;
  options: ReadonlyArray<Option<string>>;
  onCommit: (value: string) => void;
  width?: number;
}): ReactElement => {
  const [draft, setDraft] = useDraft(value);
  const commit = (next: string): void => {
    if (next !== value) onCommit(next);
  };
  return (
    <ComboBox
      className={styles.field}
      allowsCustomValue
      menuTrigger="focus"
      inputValue={draft}
      onInputChange={setDraft}
      onChange={(key) => {
        if (key === null) return;
        const next = String(key);
        setDraft(next);
        commit(next);
      }}
      onBlur={() => commit(draft)}
      onKeyDown={(event) => {
        if (event.key === `Enter`) commit(draft);
      }}
      isDisabled={isDisabled}
      isInvalid={error !== undefined}
      style={width === undefined ? undefined : { width: `${String(width)}ch` }}
    >
      <Label className={styles.label}>{label}</Label>
      <Group className={styles.comboGroup}>
        <Input className={styles.input} spellCheck={false} />
        <Button className={styles.comboButton}>
          <ChevronIcon className={styles.chevron} />
        </Button>
      </Group>
      <ErrorText error={error} />
      <Popover className={styles.popover} placement="bottom start">
        <ListBox className={styles.listBox} items={options}>
          {(option) => (
            <ListBoxItem
              id={option.id}
              textValue={option.id}
              className={styles.option}
            >
              <span>{option.id}</span>
              {option.label === option.id ? null : (
                <span className={styles.optionDetail}>{option.label}</span>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
};

/** On or off, applied at once. */
export const ToggleField = ({
  label,
  isSelected,
  onChange,
  isDisabled
}: Omit<CommonProps, `error`> & {
  isSelected: boolean;
  onChange: (value: boolean) => void;
}): ReactElement => (
  <SwitchField
    className={styles.field}
    isSelected={isSelected}
    onChange={onChange}
    isDisabled={isDisabled}
  >
    {/* An empty line where the other fields have their label, so the switch lines up with their controls. */}
    <span className={styles.label} aria-hidden="true">
      {` `}
    </span>
    <SwitchButton className={styles.switch}>
      <span className={styles.track} />
      {label}
    </SwitchButton>
  </SwitchField>
);

/** One choice from a list that may be long. */
export const SelectField = <T extends string>({
  label,
  value,
  options,
  onChange,
  isDisabled,
  error
}: CommonProps & {
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
}): ReactElement => (
  <Select
    className={styles.field}
    value={value}
    onChange={(key: Key | null) => {
      const option = options.find((candidate) => candidate.id === key);
      if (option !== undefined) onChange(option.id);
    }}
    isDisabled={isDisabled}
    isInvalid={error !== undefined}
  >
    <Label className={styles.label}>{label}</Label>
    <Button className={styles.selectButton}>
      <SelectValue className={styles.selectValue} />
      <ChevronIcon className={styles.chevron} />
    </Button>
    <ErrorText error={error} />
    <Popover className={styles.popover} placement="bottom start">
      <ListBox className={styles.listBox} items={options}>
        {(option) => (
          <ListBoxItem
            id={option.id}
            textValue={option.label}
            className={styles.option}
          >
            <span>{option.label}</span>
            {option.detail === undefined ? null : (
              <span className={styles.optionDetail}>{option.detail}</span>
            )}
          </ListBoxItem>
        )}
      </ListBox>
    </Popover>
  </Select>
);
