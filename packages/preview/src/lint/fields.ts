import { isObject } from "@discordkit/core/utils/isObject";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { selectTypes } from "../components.js";
import type { Finding, LintCode, Path } from "../findings.js";
import {
  characters,
  fileTypeCategories,
  maxFileTypes,
  maxGroupOptions,
  maxGroupOptionText,
  maxGroupValues,
  maxLabel,
  maxLabelDescription,
  maxTextInputLength,
  maxTextInputPlaceholder,
  minCheckboxOptions,
  minRadioOptions
} from "./limits.js";

/**
 * The checks for what a modal holds: labels and the fields they wrap. Each is a rule Discord's component reference states that @discordkit/client's schemas do not enforce, or a limit worth a clearer message than the schema's. Pure: a component in, findings out, with paths that start at the component's own path.
 */

const text = (value: unknown): string | undefined =>
  typeof value === `string` ? value : undefined;

const number = (value: unknown): number | undefined =>
  typeof value === `number` ? value : undefined;

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const selects = new Set<unknown>(selectTypes);

/** Whether a field must be answered before the modal can be submitted. Discord's default for every field that has `required` is `true`. */
export const isRequired = (node: Record<string, unknown>): boolean =>
  node.required !== false;

/** The fields whose `min_values` the reference ties to `required`: "`min_values` must be either omitted or at least `1` if `required` is omitted or `true`". */
const minValuesTiedToRequired = new Set<unknown>([
  ...selectTypes,
  ComponentType.FileUpload,
  ComponentType.CheckboxGroup
]);

/**
 * Findings for one component of a modal (or a modal's component misplaced in a message, which lint reports separately). `surface` is where it sits, for the rules that differ: a select's `required` applies only in a modal, and `disabled` is refused there.
 */
export const fieldFindings = (
  node: Record<string, unknown>,
  path: Path,
  surface: `message` | `modal`
): Finding[] => {
  const findings: Finding[] = [];
  const add = (
    code: LintCode,
    severity: Finding[`severity`],
    at: Path,
    message: string
  ): void => {
    findings.push({ code, severity, path: at, message });
  };
  const type = node.type;

  if (type === ComponentType.Label) {
    const label = text(node.label);
    if (label !== undefined && characters(label) > maxLabel) {
      add(
        `label-length`,
        `error`,
        [...path, `label`],
        `This label is ${String(characters(label))} characters, over Discord's limit of ${String(maxLabel)}, so Discord would refuse the modal. A label is the field's title; shorten it, and put the explanation in \`description\` (up to ${String(maxLabelDescription)} characters).`
      );
    }
    const description = text(node.description);
    if (
      description !== undefined &&
      characters(description) > maxLabelDescription
    ) {
      add(
        `label-description-length`,
        `error`,
        [...path, `description`],
        `This label's description is ${String(characters(description))} characters, over Discord's limit of ${String(maxLabelDescription)}, so Discord would refuse the modal. Shorten it, or move the longer explanation into a Text Display above the field.`
      );
    }
  }

  if (type === ComponentType.TextInput) {
    const min = number(node.minLength);
    const max = number(node.maxLength);
    const bounds: Array<
      [`minLength` | `maxLength`, number | undefined, number]
    > = [
      [`minLength`, min, 0],
      [`maxLength`, max, 1]
    ];
    for (const [field, value, lowest] of bounds) {
      if (
        value !== undefined &&
        (value < lowest || value > maxTextInputLength)
      ) {
        add(
          `text-input-length-range`,
          `error`,
          [...path, field],
          `\`${field}\` is ${String(value)}, outside the ${String(lowest)} to ${maxTextInputLength.toLocaleString(`en-US`)} Discord allows, so Discord would refuse the modal. Set it within that range, or leave it out.`
        );
      }
    }
    if (min !== undefined && max !== undefined && min > max) {
      add(
        `text-input-length-range`,
        `error`,
        [...path, `minLength`],
        `\`minLength\` (${String(min)}) is more than \`maxLength\` (${String(max)}), so no answer could be long enough and short enough at once, and Discord refuses the modal. Lower \`minLength\` or raise \`maxLength\`.`
      );
    }
    const value = text(node.value);
    if (value !== undefined) {
      const used = characters(value);
      if (used > maxTextInputLength) {
        add(
          `text-input-value-length`,
          `error`,
          [...path, `value`],
          `The pre-filled \`value\` is ${used.toLocaleString(`en-US`)} characters, over Discord's limit of ${maxTextInputLength.toLocaleString(`en-US`)}, so Discord would refuse the modal. Shorten it.`
        );
      } else if (
        (min !== undefined && used < min) ||
        (max !== undefined && used > max)
      ) {
        add(
          `text-input-value-range`,
          `warning`,
          [...path, `value`],
          `The pre-filled \`value\` is ${String(used)} characters, outside this input's ${min !== undefined && used < min ? `\`minLength\` of ${String(min)}` : `\`maxLength\` of ${String(max)}`}, so the person cannot submit the modal until they change it. Pre-fill a value that fits, or change the limits.`
        );
      }
    }
    const placeholder = text(node.placeholder);
    if (
      placeholder !== undefined &&
      characters(placeholder) > maxTextInputPlaceholder
    ) {
      add(
        `text-input-placeholder-length`,
        `error`,
        [...path, `placeholder`],
        `This placeholder is ${String(characters(placeholder))} characters, over Discord's limit of ${String(maxTextInputPlaceholder)}, so Discord would refuse the modal. A placeholder is a hint shown in the empty box; shorten it, and put the explanation in the Label's \`description\`.`
      );
    }
    const label = text(node.label);
    if (label !== undefined && characters(label) > maxLabel) {
      add(
        `label-length`,
        `error`,
        [...path, `label`],
        `This text input's label is ${String(characters(label))} characters, over Discord's limit of ${String(maxLabel)}, so Discord would refuse the modal. Shorten it.`
      );
    }
  }

  if (selects.has(type)) {
    if (surface === `modal` && node.disabled === true) {
      add(
        `modal-disabled`,
        `error`,
        [...path, `disabled`],
        `This select menu is \`disabled\`, but Discord's reference says a disabled component in a modal is an error: modals cannot hold disabled components. Remove \`disabled\`, or leave the field out of the modal.`
      );
    }
    if (surface === `message` && node.required !== undefined) {
      add(
        `select-required-in-message`,
        `warning`,
        [...path, `required`],
        `\`required\` applies only to a select menu in a modal; in a message Discord ignores it. Remove it, or move the select into a modal's Label if it is meant to be a question that must be answered.`
      );
    }
  }

  if (
    surface === `modal` &&
    minValuesTiedToRequired.has(type) &&
    isRequired(node) &&
    node.minValues === 0
  ) {
    add(
      `min-values-required`,
      `error`,
      [...path, `minValues`],
      `\`minValues\` is 0, but this field is required (${node.required === undefined ? `\`required\` defaults to true` : `\`required\` is true`}), and Discord requires \`minValues\` to be left out or at least 1 when it is, so it would refuse the modal. To let the field be skipped, set \`required\` to false; otherwise remove \`minValues\` or set it to 1 or more.`
    );
  }

  const groups: Partial<Record<number, { name: string; min: number }>> = {
    [ComponentType.RadioGroup]: { name: `radio group`, min: minRadioOptions },
    [ComponentType.CheckboxGroup]: {
      name: `checkbox group`,
      min: minCheckboxOptions
    }
  };
  const group = typeof type === `number` ? groups[type] : undefined;
  const options = list(node.options);
  if (group !== undefined) {
    if (options.length < group.min || options.length > maxGroupOptions) {
      add(
        `group-option-count`,
        `error`,
        [...path, `options`],
        `This ${group.name} has ${String(options.length)} options, but Discord allows ${String(group.min)} to ${String(maxGroupOptions)}, so it would refuse the modal. ${options.length < group.min ? (type === ComponentType.RadioGroup ? `A choice needs at least two options; for one yes-or-no question use a Checkbox.` : `Add an option.`) : `Keep the ${String(maxGroupOptions)} that matter most, or use a String Select, which takes up to 25.`}`
      );
    }
    options.forEach((option: unknown, index) => {
      if (!isObject(option)) return;
      for (const field of [`label`, `value`, `description`] as const) {
        const value = text(option[field]);
        if (value === undefined || characters(value) <= maxGroupOptionText) {
          continue;
        }
        add(
          `group-option-length`,
          `error`,
          [...path, `options`, index, field],
          `This option's \`${field}\` is ${String(characters(value))} characters, over Discord's limit of ${String(maxGroupOptionText)}, so Discord would refuse the modal. ${field === `value` ? `The value only identifies the choice to your app; use a short key.` : `Shorten it.`}`
        );
      }
    });
  }

  if (type === ComponentType.RadioGroup) {
    const defaults = options.filter(
      (option) => isObject(option) && option.default === true
    );
    if (defaults.length > 1) {
      add(
        `radio-default-count`,
        `warning`,
        [...path, `options`],
        `${String(defaults.length)} options are marked \`default\`, but a radio group chooses exactly one, so they cannot all be shown chosen; the preview shows the first. Mark one option \`default\`.`
      );
    }
  }

  if (
    type === ComponentType.CheckboxGroup ||
    type === ComponentType.FileUpload
  ) {
    const what =
      type === ComponentType.FileUpload
        ? `files a person can upload`
        : `boxes a person can tick`;
    const min = number(node.minValues);
    const max = number(node.maxValues);
    const bounds: Array<
      [`minValues` | `maxValues`, number | undefined, number]
    > = [
      [`minValues`, min, 0],
      [`maxValues`, max, 1]
    ];
    for (const [field, value, lowest] of bounds) {
      if (value !== undefined && (value < lowest || value > maxGroupValues)) {
        add(
          `values-range`,
          `error`,
          [...path, field],
          `\`${field}\` is ${String(value)}, outside the ${String(lowest)} to ${String(maxGroupValues)} Discord allows for how many ${what}, so Discord would refuse the modal. Set it within that range, or leave it out.`
        );
      }
    }
    if (min !== undefined && max !== undefined && min > max) {
      add(
        `values-range`,
        `error`,
        [...path, `minValues`],
        `\`minValues\` (${String(min)}) is more than \`maxValues\` (${String(max)}), so the field could never be answered, and Discord refuses the modal. Lower \`minValues\` or raise \`maxValues\`.`
      );
    } else if (
      type === ComponentType.CheckboxGroup &&
      min !== undefined &&
      min > options.length
    ) {
      add(
        `values-range`,
        `error`,
        [...path, `minValues`],
        `\`minValues\` is ${String(min)}, but the group has only ${String(options.length)} options, so nobody could tick enough to submit the modal. Lower \`minValues\` or add options.`
      );
    }
  }

  if (type === ComponentType.FileUpload) {
    const fileTypes = list(node.fileTypes);
    if (fileTypes.length > maxFileTypes) {
      add(
        `file-types`,
        `error`,
        [...path, `fileTypes`],
        `This upload filters for ${String(fileTypes.length)} file types, over Discord's limit of ${String(maxFileTypes)}, so Discord would refuse the modal. Use a category (\`image\`, \`video\` or \`audio\`) in place of several extensions.`
      );
    }
    fileTypes.forEach((entry: unknown, index) => {
      if (
        typeof entry === `string` &&
        ((fileTypeCategories as readonly string[]).includes(entry) ||
          /^\.[^.\s/\\]+$/.test(entry))
      ) {
        return;
      }
      add(
        `file-types`,
        `warning`,
        [...path, `fileTypes`, index],
        `${JSON.stringify(entry)} is not a file type Discord's reference describes: an entry is \`image\`, \`video\`, \`audio\`, or an extension with its dot, such as \`.pdf\`. Discord may refuse it or match nothing. ${typeof entry === `string` && /^[^.\s/\\]+$/.test(entry) ? `Write it as \`.${entry}\`.` : `Use one of those forms.`}`
      );
    });
  }

  if (type === ComponentType.Checkbox && node.required !== undefined) {
    add(
      `checkbox-required`,
      `warning`,
      [...path, `required`],
      `A Checkbox has no \`required\` in Discord's reference, so this does not make it one a person must tick. To require a tick, use a Checkbox Group with a single option and \`required\` (the reference's own advice), and remove \`required\` here.`
    );
  }

  return findings;
};
