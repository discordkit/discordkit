/**
 * How a modal's fields read what a scene says has been filled in, and which of them the client would mark as wrong after Submit. Shared by lint and the renderer, so they agree on what a value means. Plain data and pure functions: no Node built-ins and no React.
 */
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { selectTypes } from "./components.js";
import { characters } from "./lint/limits.js";
import type { ModalValue } from "./scene.js";

/** What kind of value a field takes in `modal.values`. */
export interface ModalValueShape {
  /** In words, for a finding: "a string". */
  description: string;
  accepts: (value: ModalValue) => boolean;
}

const isString = (value: ModalValue): boolean => typeof value === `string`;
const isStrings = (value: ModalValue): boolean => Array.isArray(value);
const isBoolean = (value: ModalValue): boolean => typeof value === `boolean`;

const shapes: Partial<Record<number, ModalValueShape>> = {
  [ComponentType.TextInput]: {
    description: `a string, the text typed in`,
    accepts: isString
  },
  [ComponentType.RadioGroup]: {
    description: `a string, the chosen option's \`value\``,
    accepts: isString
  },
  [ComponentType.CheckboxGroup]: {
    description: `an array of the ticked options' \`value\`s`,
    accepts: isStrings
  },
  [ComponentType.FileUpload]: {
    description: `an array of the uploaded files' names`,
    accepts: isStrings
  },
  [ComponentType.Checkbox]: {
    description: `true or false, whether it is ticked`,
    accepts: isBoolean
  },
  ...Object.fromEntries(
    selectTypes.map((type) => [
      type,
      {
        description:
          type === ComponentType.StringSelect
            ? `an array of the chosen options' \`value\`s`
            : `an array of the chosen ids`,
        accepts: isStrings
      }
    ])
  )
};

/** The value a field of this type takes, or undefined for a component that is not a field (a label, a text display). */
export const modalValueShape = (type: unknown): ModalValueShape | undefined =>
  typeof type === `number` ? shapes[type] : undefined;

/** The scene's value for a field, when it has one of the right kind; otherwise undefined, and the field shows what the payload fills in. */
export const fieldValue = (
  values: Readonly<Record<string, ModalValue>> | undefined,
  field: { type: ComponentType; customId?: string }
): ModalValue | undefined => {
  if (values === undefined || field.customId === undefined) return undefined;
  if (!Object.hasOwn(values, field.customId)) return undefined;
  const value = values[field.customId];
  return modalValueShape(field.type)?.accepts(value) === true
    ? value
    : undefined;
};

/** A field as `fieldCount` and `fieldProblem` read it: any modal component, untyped past these few keys. */
export interface FieldLike {
  type: ComponentType;
  customId?: string;
  value?: string;
  required?: boolean;
  minLength?: number;
  minValues?: number;
  options?: ReadonlyArray<{ value?: string; default?: boolean }>;
  defaultValues?: readonly unknown[];
}

/**
 * How much a field holds as the scene draws it: a text input's characters, or how many values are chosen, ticked or uploaded. The scene's value when it has one of the right kind, otherwise what the payload fills in (a text input's `value`, options marked `default`, a select's `defaultValues`). A radio group holds one or none, and only an option it has counts.
 */
export const fieldCount = (
  field: FieldLike,
  value: ModalValue | undefined
): number => {
  const options = field.options ?? [];
  const defaults = options.filter((option) => option.default === true);
  const { type } = field;
  if (type === ComponentType.TextInput) {
    // Counted as lint counts, in Unicode code points; how the client counts is unverified.
    return characters(typeof value === `string` ? value : (field.value ?? ``));
  }
  if (type === ComponentType.RadioGroup) {
    const chosen = typeof value === `string` ? value : defaults[0]?.value;
    return options.some((option) => option.value === chosen) ? 1 : 0;
  }
  if (
    type === ComponentType.StringSelect ||
    type === ComponentType.CheckboxGroup
  ) {
    return Array.isArray(value)
      ? options.filter((option) => value.includes(option.value ?? ``)).length
      : defaults.length;
  }
  if (type === ComponentType.FileUpload) {
    return Array.isArray(value) ? value.length : 0;
  }
  if (type === ComponentType.Checkbox) return value === true ? 1 : 0;
  // A member, role, mentionable or channel select.
  return Array.isArray(value)
    ? value.length
    : (field.defaultValues?.length ?? 0);
};

/** Why the client would refuse to submit a field as it stands, or null. */
export type FieldProblem =
  | { kind: `required` }
  | { kind: `tooShort`; min: number }
  | { kind: `tooFew`; min: number };

/**
 * Whether a field, holding `count` characters (a text input) or `count` chosen values (anything else), stops the modal being submitted: a required field left empty, a text shorter than its `minLength`, or fewer choices than its `minValues`. What the client checks, as Discord's reference describes the fields; the words it shows are the renderer's.
 */
export const fieldProblem = (
  field: {
    type: ComponentType;
    required?: boolean;
    minLength?: number;
    minValues?: number;
  },
  count: number
): FieldProblem | null => {
  // A checkbox cannot be required (the reference's own note), so it is never wrong.
  if (field.type === ComponentType.Checkbox) return null;
  const required = field.required !== false;
  if (count === 0) return required ? { kind: `required` } : null;
  if (field.type === ComponentType.TextInput) {
    return field.minLength !== undefined && count < field.minLength
      ? { kind: `tooShort`, min: field.minLength }
      : null;
  }
  // A radio group takes exactly one; the others default `minValues` to 1.
  const min =
    field.type === ComponentType.RadioGroup ? 1 : (field.minValues ?? 1);
  return count < min ? { kind: `tooFew`, min } : null;
};
