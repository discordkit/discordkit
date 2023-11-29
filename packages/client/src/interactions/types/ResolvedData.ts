import {
  object,
  record,
  nullish,
  partial,
  recursive,
  type Output,
  type StringSchema
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { memberSchema } from "../../guild/types/Member.js";
import { roleSchema } from "../../guild/types/Role.js";
import { attachmentSchema } from "../../channel/types/Attachment.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { messageSchema } from "../../channel/types/Message.js";

export const resolvedDataSchema = object({
  /** the ids and User objects */
  users: nullish(record(snowflake as unknown as StringSchema, userSchema)),
  /** the ids and partial Member objects */
  members: nullish(
    record(snowflake as unknown as StringSchema, partial(memberSchema))
  ),
  /** the ids and Role objects */
  roles: nullish(record(snowflake as unknown as StringSchema, roleSchema)),
  /** the ids and partial Channel objects */
  channels: nullish(
    record(snowflake as unknown as StringSchema, partial(channelSchema))
  ),
  /** the ids and partial Message objects */
  messages: nullish(
    record(
      snowflake as unknown as StringSchema,
      recursive(() => partial(messageSchema))
    )
  ),
  /** the ids and attachment objects */
  attachments: nullish(
    record(snowflake as unknown as StringSchema, attachmentSchema)
  )
});

export type ResolvedData = Output<typeof resolvedDataSchema>;
