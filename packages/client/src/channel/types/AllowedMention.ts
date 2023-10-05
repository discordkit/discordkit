import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const allowedMentionSchema = z.object({
  /** An array of allowed mention types to parse from the content. */
  parse: z.enum([`role`, `users`, `everyone`]).array(),
  /** Array of roleIds to mention (Max size of 100) */
  roles: snowflake.array().max(100),
  /** Array of userIds to mention (Max size of 100) */
  users: snowflake.array().max(100),
  /** For replies, whether to mention the author of the message being replied to (default false) */
  repliedUser: z.boolean().optional()
});

export type AllowedMention = z.infer<typeof allowedMentionSchema>;
