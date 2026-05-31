import { variantSchema } from "@discordkit/core";
import { type ActionRow, actionRowSchema } from "./ActionRow.js";
import { type Button, buttonSchema } from "./Button.js";
import { type StringSelect, stringSelectSchema } from "./StringSelect.js";
import { type TextInput, textInputSchema } from "./TextInput.js";
import { type UserSelect, userSelectSchema } from "./UserSelect.js";
import { type RoleSelect, roleSelectSchema } from "./RoleSelect.js";
import {
  type MentionableSelect,
  mentionableSelectSchema
} from "./MentionableSelect.js";
import { type ChannelSelect, channelSelectSchema } from "./ChannelSelect.js";
import { type Section, sectionSchema } from "./Section.js";
import { type TextDisplay, textDisplaySchema } from "./TextDisplay.js";
import { type Thumbnail, thumbnailSchema } from "./Thumbnail.js";
import { type MediaGallery, mediaGallerySchema } from "./MediaGallery.js";
import { type File, fileSchema } from "./File.js";
import { type Separator, separatorSchema } from "./Separator.js";
import { type Container, containerSchema } from "./Container.js";
import { type Label, labelSchema } from "./Label.js";
import { type FileUpload, fileUploadSchema } from "./FileUpload.js";
import { type RadioGroup, radioGroupSchema } from "./RadioGroup.js";
import { type CheckboxGroup, checkboxGroupSchema } from "./CheckboxGroup.js";
import { type Checkbox, checkboxSchema } from "./Checkbox.js";

export type Component =
  | ActionRow
  | Button
  | StringSelect
  | TextInput
  | UserSelect
  | RoleSelect
  | MentionableSelect
  | ChannelSelect
  | Section
  | TextDisplay
  | Thumbnail
  | MediaGallery
  | File
  | Separator
  | Container
  | Label
  | FileUpload
  | RadioGroup
  | CheckboxGroup
  | Checkbox;

/**
 * ### [Component](https://discord.com/developers/docs/components/reference#component-object-component-types)
 */
export const componentSchema = variantSchema<Component>(`type`, [
  actionRowSchema,
  buttonSchema,
  stringSelectSchema,
  textInputSchema,
  userSelectSchema,
  roleSelectSchema,
  mentionableSelectSchema,
  channelSelectSchema,
  sectionSchema,
  textDisplaySchema,
  thumbnailSchema,
  mediaGallerySchema,
  fileSchema,
  separatorSchema,
  containerSchema,
  labelSchema,
  fileUploadSchema,
  radioGroupSchema,
  checkboxGroupSchema,
  checkboxSchema
]);

/**
 * @deprecated Use {@link componentSchema} instead. This alias preserves the
 * old misspelled export name (`componenetSchema`) for one release so
 * existing imports keep working. It will be removed in a future major.
 */
export const componenetSchema = componentSchema;
