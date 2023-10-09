import { nativeEnum } from "valibot";

export enum ComponentType {
  /** Container for other components */
  ActionRow = 1,
  /** Button object */
  Button = 2,
  /** Select menu for picking from defined text options */
  StringSelect = 3,
  /** Text input object */
  TextInput = 4,
  /** Select menu for users */
  UserSelect = 5,
  /** Select menu for roles */
  RoleSelect = 6,
  /** Select menu for mentionables (users and roles) */
  MentionableSelect = 7,
  /** Select menu for channels */
  ChannelSelect = 8
}

export const componentTypeSchema = nativeEnum(ComponentType);
