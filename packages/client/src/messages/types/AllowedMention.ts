import * as v from "valibot";
import { boundedArray, snowflake } from "@discordkit/core";

export const allowedMentionSchema = v.partial(
  v.object({
    /** An array of allowed mention types to parse from the content. */
    parse: v.array(v.picklist([`role`, `users`, `everyone`])),
    /** Array of roleIds to mention (Max size of 100) */
    roles: boundedArray(snowflake, { max: 100 }),
    /** Array of userIds to mention (Max size of 100) */
    users: boundedArray(snowflake, { max: 100 }),
    /** For replies, whether to mention the author of the message being replied to (default false) */
    repliedUser: v.boolean()
  })
);

export interface AllowedMention
  extends v.InferOutput<typeof allowedMentionSchema> {}
