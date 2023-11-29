import { snowflake } from "@discordkit/core";
import {
  object,
  picklist,
  array,
  maxLength,
  boolean,
  optional,
  type Output
} from "valibot";

export const allowedMentionSchema = object({
  /** An array of allowed mention types to parse from the content. */
  parse: array(picklist([`role`, `users`, `everyone`])),
  /** Array of roleIds to mention (Max size of 100) */
  roles: array(snowflake, [maxLength(100)]),
  /** Array of userIds to mention (Max size of 100) */
  users: array(snowflake, [maxLength(100)]),
  /** For replies, whether to mention the author of the message being replied to (default false) */
  repliedUser: optional(boolean())
});

export type AllowedMention = Output<typeof allowedMentionSchema>;
