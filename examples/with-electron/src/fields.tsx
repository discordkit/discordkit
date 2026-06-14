import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues
} from "react-hook-form";
import { Input, Label, NumberField, TextField } from "react-aria-components";
import { tokens } from "./ui.js";

/** Control whose transformed-output/context generics are irrelevant to a single
 * field — only the input field-values type `T` matters here. */
type AnyControl<T extends FieldValues> = Control<T, unknown, FieldValues>;

const fieldClass = tokens.field;
const inputClass = tokens.input;

/**
 * A text field wired to React Hook Form via `Controller`. React Aria's fields
 * are controlled, so they integrate through `Controller` (not `register`).
 * Generic over the form so it works with nested field paths
 * (e.g. `assets.largeImage`, `buttons.0.label`).
 */
export const TextControl = <T extends FieldValues>({
  control,
  name,
  label
}: {
  control: AnyControl<T>;
  name: FieldPath<T>;
  label: string;
}): React.JSX.Element => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <TextField
        className={fieldClass}
        value={String(field.value ?? ``)}
        onChange={field.onChange}
        onBlur={field.onBlur}
      >
        <Label className={tokens.label}>{label}</Label>
        <Input className={inputClass} ref={field.ref} />
      </TextField>
    )}
  />
);

/** A numeric field wired to React Hook Form via `Controller`. */
export const NumberControl = <T extends FieldValues>({
  control,
  name,
  label
}: {
  control: AnyControl<T>;
  name: FieldPath<T>;
  label: string;
}): React.JSX.Element => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <NumberField
        className={fieldClass}
        value={Number(field.value ?? 0)}
        onChange={field.onChange}
        onBlur={field.onBlur}
        minValue={0}
      >
        <Label className={tokens.label}>{label}</Label>
        <Input className={inputClass} ref={field.ref} />
      </NumberField>
    )}
  />
);
