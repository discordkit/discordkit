import { variantSchema } from "@discordkit/core/validations/schema";
import { type StringSelect, stringSelectSchema } from "./StringSelect.js";
import { type UserSelect, userSelectSchema } from "./UserSelect.js";
import { type RoleSelect, roleSelectSchema } from "./RoleSelect.js";
import {
  type MentionableSelect,
  mentionableSelectSchema
} from "./MentionableSelect.js";
import { type ChannelSelect, channelSelectSchema } from "./ChannelSelect.js";

export type Select =
  | StringSelect
  | UserSelect
  | RoleSelect
  | MentionableSelect
  | ChannelSelect;

export const selectSchema = variantSchema<Select>(`type`, [
  stringSelectSchema,
  userSelectSchema,
  roleSelectSchema,
  mentionableSelectSchema,
  channelSelectSchema
]);
