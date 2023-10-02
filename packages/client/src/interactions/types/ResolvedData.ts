import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.ts";
import { memberSchema } from "../../guild/types/Member.ts";
import { roleSchema } from "../../guild/types/Role.ts";
import { attachmentSchema } from "../../channel/types/Attachment.ts";
import { channelSchema } from "../../channel/types/Channel.ts";
import { messageSchema } from "../../channel/types/Message.ts";

export const resolvedDataSchema = z.object({
  /** the ids and User objects */
  users: z.record(snowflake, userSchema).nullable(),
  /** the ids and partial Member objects */
  members: z.record(snowflake, memberSchema.partial()).nullable(),
  /** the ids and Role objects */
  roles: z.record(snowflake, roleSchema).nullable(),
  /** the ids and partial Channel objects */
  channels: z.record(snowflake, channelSchema.partial()).nullable(),
  /** the ids and partial Message objects */
  messages: z
    .record(
      snowflake,
      z.lazy(() => messageSchema.partial())
    )
    .nullable(),
  /** the ids and attachment objects */
  attachments: z.record(snowflake, attachmentSchema).nullable()
});

export type ResolvedData = z.infer<typeof resolvedDataSchema>;
