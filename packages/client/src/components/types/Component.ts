import * as v from "valibot";
import { buttonSchema } from "./Button.js";
import { textInputSchema } from "./TextInput.js";
import { actionRowSchema } from "./ActionRow.js";
import { stringSelectSchema } from "./StringSelect.js";
import { userSelectSchema } from "./UserSelect.js";
import { roleSelectSchema } from "./RoleSelect.js";
import { mentionableSelectSchema } from "./MentionableSelect.js";
import { channelSelectSchema } from "./ChannelSelect.js";
import { sectionSchema } from "./Section.js";
import { textDisplaySchema } from "./TextDisplay.js";
import { thumbnailSchema } from "./Thumbnail.js";
import { mediaGallerySchema } from "./MediaGallery.js";
import { fileSchema } from "./File.js";
import { separatorSchema } from "./Separator.js";
import { containerSchema } from "./Container.js";
import { labelSchema } from "./Label.js";
import { fileUploadSchema } from "./FileUpload.js";
import { radioGroupSchema } from "./RadioGroup.js";
import { checkboxGroupSchema } from "./CheckboxGroup.js";
import { checkboxSchema } from "./Checkbox.js";

/**
 * ### [Component](https://discord.com/developers/docs/components/reference#component-object-component-types)
 */
export const componentSchema = v.variant(`type`, [
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

export type Component = v.InferOutput<typeof componentSchema>;

/**
 * @deprecated Use {@link componentSchema} instead. This alias preserves the
 * old misspelled export name (`componenetSchema`) for one release so
 * existing imports keep working. It will be removed in a future major.
 */
export const componenetSchema = componentSchema;
