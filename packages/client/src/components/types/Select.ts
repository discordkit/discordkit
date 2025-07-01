import * as v from "valibot";
import { stringSelectSchema } from "./StringSelect.js";
import { userSelectSchema } from "./UserSelect.js";
import { roleSelectSchema } from "./RoleSelect.js";
import { mentionableSelectSchema } from "./MentionableSelect.js";
import { channelSelectSchema } from "./ChannelSelect.js";

export const selectSchema = v.variant(`type`, [
  stringSelectSchema,
  userSelectSchema,
  roleSelectSchema,
  mentionableSelectSchema,
  channelSelectSchema
]);

export type Select = v.InferOutput<typeof selectSchema>;
