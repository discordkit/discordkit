import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues
} from "react-hook-form";
import { Input, Label, NumberField, TextField } from "react-aria-components";

/**
 * Form-field family. React Aria's fields are controlled, so they integrate with
 * React Hook Form through `Controller` (not `register`). Each control is generic
 * over the form so it works with nested field paths (e.g. `activity.party.size`).
 *
 * The shared input/label classes live here as token-based constants (not a global
 * styles object), co-located with the only components that use them.
 */

/** Shared field styles — semantic tokens so the whole form re-themes at once. */
export const fieldStyles = {
  wrapper: `flex flex-col gap-1.5`,
  label: `text-xs font-semibold uppercase tracking-wide text-text-muted`,
  input: `h-10 w-full rounded-md border border-edge bg-surface px-3 text-sm text-text outline-none placeholder:text-text-subtle focus:border-brand`
} as const;

/** Control whose transformed-output/context generics are irrelevant to a single
 * field — only the input field-values type `T` matters here. */
type AnyControl<T extends FieldValues> = Control<T, unknown, FieldValues>;

/** A text field wired to React Hook Form via `Controller`. */
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
        className={fieldStyles.wrapper}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
      >
        <Label className={fieldStyles.label}>{label}</Label>
        <Input className={fieldStyles.input} ref={field.ref} />
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
        className={fieldStyles.wrapper}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        minValue={0}
      >
        <Label className={fieldStyles.label}>{label}</Label>
        <Input className={fieldStyles.input} ref={field.ref} />
      </NumberField>
    )}
  />
);
