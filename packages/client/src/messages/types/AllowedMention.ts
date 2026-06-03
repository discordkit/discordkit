import * as v from "valibot";
import { boundedArray } from "@discordkit/core/validations/boundedArray";
import { snowflake } from "@discordkit/core/validations/snowflake";

/**
 * ### [Allowed Mention](https://discord.com/developers/docs/resources/message#allowed-mentions-object)
 *
 * Setting the `allowedMentions` field lets you determine whether users will receive notifications when you include mentions in the message content, or the content of components attached to that message. This field is always validated against your permissions and the presence of said mentions in the message, to avoid "phantom" pings where users receive a notification without a visible mention in the message. For example, if you want to ping everyone, including it in the `allowedMentions` field is not enough, the mention format (`@everyone`) must also be present in the content of the message or its components. It is important to note that setting this field **does not** guarantee a push notification will be sent, as additional factors can influence this: - To mention roles and notify their members, the role's `mentionable` field must be set to `true`, or the bot must have the `MENTION_EVERYONE` permission - To mention `@everyone` and `@here`, the bot must have the `MENTION_EVERYONE` permission - Setting the `SUPPRESS_NOTIFICATIONS` flag when sending a message will disable push notifications and only cause a notification badge - Users can customize their notification settings through the Discord app, which might cause them to only receive a notification badge and no push notification
 */
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

export interface AllowedMention extends v.InferOutput<
  typeof allowedMentionSchema
> {}
