import { union, type InferOutput } from "valibot";
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

export const componenetSchema = union([
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
  containerSchema
]);

export type Component = InferOutput<typeof componenetSchema>;
