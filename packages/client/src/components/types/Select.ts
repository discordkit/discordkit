import type { InferOutput } from "valibot";
import { variant } from "valibot";
import { stringSelectSchema } from "./StringSelect.js";
import { userSelectSchema } from "./UserSelect.js";
import { roleSelectSchema } from "./RoleSelect.js";
import { mentionableSelectSchema } from "./MentionableSelect.js";
import { channelSelectSchema } from "./ChannelSelect.js";

export const selectSchema = variant(`type`, [
  stringSelectSchema,
  userSelectSchema,
  roleSelectSchema,
  mentionableSelectSchema,
  channelSelectSchema
]);

export type Select = InferOutput<typeof selectSchema>;
