// https://discord.com/developers/docs/events/gateway-events#message-create

import * as v from "valibot";
import { partialSchema, schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import {
  type Member,
  memberSchema
} from "@discordkit/client/guild/types/Member";
import {
  type Message,
  messageSchema
} from "@discordkit/client/messages/types/Message";
import { type User, userSchema } from "@discordkit/client/user/types/User";

/**
 * The extra fields `MESSAGE_CREATE` adds on top of a
 * {@link Message | message object}.
 *
 * Discord documents dispatch payloads as "the inner payload is a <resource>
 * object with the following extra fields", so the schema is composed from
 * client's rather than redefined — the resource stays a single source of truth.
 */
const _messageCreateExtraSchema = v.object({
  /** ID of the guild the message was sent in - unless it is an ephemeral message */
  guildId: v.optional(snowflake),
  /** Member properties for this message's author. Missing for ephemeral messages and messages from webhooks */
  member: v.optional(partialSchema<Member>(memberSchema)),
  /** Users specifically mentioned in the message */
  mentions: v.optional(v.array(userSchema)),
  /** The [type of channel](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) the message was sent in */
  channelType: v.optional(v.number())
});

/**
 * `mentions` is omitted from the base rather than merged: `MESSAGE_CREATE`
 * *refines* it (each user "optionally with an additional partial member
 * field"), so the two declarations genuinely conflict. Omitting states "as a
 * message, except this field" — which is what the docs describe.
 */
export interface MessageCreate
  extends
    Omit<Message, `mentions`>,
    v.InferOutput<typeof _messageCreateExtraSchema> {}

/**
 * ### [Message Create](https://discord.com/developers/docs/events/gateway-events#message-create)
 *
 * Sent when a message is created. The inner payload is a
 * {@link Message | message object} with extra fields.
 *
 * > [!WARNING]
 * >
 * > Without the privileged `MESSAGE_CONTENT` intent, `content`, `embeds`,
 * > `attachments`, `components`, and `poll` arrive **empty** — the event still
 * > fires. This fails silently rather than erroring, so blank messages almost
 * > always mean a missing intent.
 */
export const messageCreateSchema = schema<MessageCreate>(
  v.intersect([messageSchema, _messageCreateExtraSchema])
);
