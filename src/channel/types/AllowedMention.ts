import { z } from "zod";

export const allowedMention = z.object({
  /** An array of allowed mention types to parse from the content. */
  parse: z.array(z.enum([`role`, `users`, `everyone`])),
  /** Array of role_ids to mention (Max size of 100) */
  roles: z.array(z.string()).max(100),
  /** Array of user_ids to mention (Max size of 100) */
  users: z.array(z.string()).max(100),
  /** For replies, whether to mention the author of the message being replied to (default false) */
  repliedUser: z.boolean().optional()
});

export type AllowedMention = z.infer<typeof allowedMention>;
