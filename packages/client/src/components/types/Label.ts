import * as v from "valibot";
import { boundedInteger, boundedString } from "@discordkit/core";
import { ComponentType } from "./ComponentType.js";
import { textInputSchema } from "./TextInput.js";
import { stringSelectSchema } from "./StringSelect.js";
import { userSelectSchema } from "./UserSelect.js";
import { roleSelectSchema } from "./RoleSelect.js";
import { mentionableSelectSchema } from "./MentionableSelect.js";
import { channelSelectSchema } from "./ChannelSelect.js";
import { fileUploadSchema } from "./FileUpload.js";
import { radioGroupSchema } from "./RadioGroup.js";
import { checkboxGroupSchema } from "./CheckboxGroup.js";
import { checkboxSchema } from "./Checkbox.js";

/**
 * A Label is a top-level layout component. Labels wrap modal components
 * with text as a label and optional description.
 *
 * > [!NOTE]
 * >
 * > The `description` may display above or below the `component` depending
 * > on the platform.
 *
 * Discord recommends using Label over an Action Row in modals. Action Row
 * with Text Inputs in modals are deprecated.
 */
export const labelSchema = v.object({
  /** `18` for a label */
  type: v.literal(ComponentType.Label),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** The label text; max 45 characters */
  label: boundedString({ max: 45 }),
  /** An optional description text for the label; max 100 characters */
  description: v.exactOptional(boundedString({ max: 100 })),
  /** The component within the label */
  component: v.variant(`type`, [
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

export interface Label extends v.InferOutput<typeof labelSchema> {}
