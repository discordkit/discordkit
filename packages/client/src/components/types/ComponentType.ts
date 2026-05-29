import * as v from "valibot";

export enum ComponentType {
  /** Container to display a row of interactive components (Style: `Layout`, Usage: `Message`) */
  ActionRow = 1,
  /** Button object (Style: `Interactive`, Usage: `Message`) */
  Button = 2,
  /** Select menu for picking from defined text options (Style: `Interactive`, Usage: `Message`, `Modal`) */
  StringSelect = 3,
  /** Text input object (Style: `Interactive`, Usage: `Modal`) */
  TextInput = 4,
  /** Select menu for users (Style: `Interactive`, Usage: `Message`, `Modal`) */
  UserSelect = 5,
  /** Select menu for roles (Style: `Interactive`, Usage: `Message`, `Modal`) */
  RoleSelect = 6,
  /** Select menu for mentionables (users and roles) (Style: `Interactive`, Usage: `Message`, `Modal`) */
  MentionableSelect = 7,
  /** Select menu for channels (Style: `Interactive`, Usage: `Message`, `Modal`) */
  ChannelSelect = 8,
  /** Container to display text alongside an accessory component (Style: `Layout`, Usage: `Message`) */
  Section = 9,
  /** Markdown text (Style: `Content`, Usage: `Message`, `Modal`) */
  TextDisplay = 10,
  /** Small image that can be used as an accessory (Style: `Content`, Usage: `Message`) */
  Thumbnail = 11,
  /** Display images and other media (Style: `Content`, Usage: `Message`) */
  MediaGallery = 12,
  /** Displays an attached file (Style: `Content`, Usage: `Message`) */
  File = 13,
  /** Component to add vertical padding between other components (Style: `Layout`, Usage: `Message`) */
  Separator = 14,
  /** Container that visually groups a set of components (Style: `Layout`, Usage: `Message`) */
  Container = 17,
  /** Container associating a label and description with a child component (Style: `Layout`, Usage: `Modal`) */
  Label = 18,
  /** Component for uploading files (Style: `Interactive`, Usage: `Modal`) */
  FileUpload = 19,
  /** Single-choice set of options (Style: `Interactive`, Usage: `Modal`) */
  RadioGroup = 21,
  /** Multi-selectable group of checkboxes (Style: `Interactive`, Usage: `Modal`) */
  CheckboxGroup = 22,
  /** Single checkbox for yes/no choice (Style: `Interactive`, Usage: `Modal`) */
  Checkbox = 23
}

export const componentTypeSchema = v.enum_(ComponentType);
