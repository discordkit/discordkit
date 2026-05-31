import * as v from "valibot";
import {
  boundedInteger,
  boundedString,
  schema,
  variantSchema
} from "@discordkit/core";
import { ComponentType } from "./ComponentType.js";
import { type TextInput, textInputSchema } from "./TextInput.js";
import { type StringSelect, stringSelectSchema } from "./StringSelect.js";
import { type UserSelect, userSelectSchema } from "./UserSelect.js";
import { type RoleSelect, roleSelectSchema } from "./RoleSelect.js";
import {
  type MentionableSelect,
  mentionableSelectSchema
} from "./MentionableSelect.js";
import { type ChannelSelect, channelSelectSchema } from "./ChannelSelect.js";
import { type FileUpload, fileUploadSchema } from "./FileUpload.js";
import { type RadioGroup, radioGroupSchema } from "./RadioGroup.js";
import { type CheckboxGroup, checkboxGroupSchema } from "./CheckboxGroup.js";
import { type Checkbox, checkboxSchema } from "./Checkbox.js";

type LabelComponent =
  | TextInput
  | StringSelect
  | UserSelect
  | RoleSelect
  | MentionableSelect
  | ChannelSelect
  | FileUpload
  | RadioGroup
  | CheckboxGroup
  | Checkbox;

const _labelSchema = v.object({
  /** `18` for a label */
  type: v.literal(ComponentType.Label),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** The label text; max 45 characters */
  label: boundedString({ max: 45 }),
  /** An optional description text for the label; max 100 characters */
  description: v.exactOptional(boundedString({ max: 100 })),
  /** The component within the label */
  component: variantSchema<LabelComponent>(`type`, [
    textInputSchema,
    stringSelectSchema,
    userSelectSchema,
    roleSelectSchema,
    mentionableSelectSchema,
    channelSelectSchema,
    fileUploadSchema,
    radioGroupSchema,
    checkboxGroupSchema,
    checkboxSchema
  ])
});

export interface Label extends v.InferOutput<typeof _labelSchema> {}

/**
 * ### [Label](https://discord.com/developers/docs/components/reference#label)
 *
 * A Label is a top-level layout component. Labels wrap modal components with text as a label and optional description.
 *
 * > [!NOTE]
 * >
 * > The `description` may display above or below the `component` depending
 * > on the platform.
 *
 * Discord recommends using Label over an Action Row in modals. Action Row with Text Inputs in modals are deprecated.
 */
export const labelSchema = schema<Label>(_labelSchema);
