import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { memberSchema } from "../../guild/types/Member.js";
import { roleSchema } from "../../guild/types/Role.js";
import { attachmentSchema } from "../../channel/types/Attachment.js";
import { channelSchema } from "../../channel/types/Channel.js";
import { messageSchema } from "../../channel/types/Message.js";

export const resolvedDataSchema = z.object({
  /** the ids and User objects */
  users: z.record(snowflake, userSchema).nullish(),
  /** the ids and partial Member objects */
  members: z.record(snowflake, memberSchema.partial()).nullish(),
  /** the ids and Role objects */
  roles: z.record(snowflake, roleSchema).nullish(),
  /** the ids and partial Channel objects */
  channels: z.record(snowflake, channelSchema.partial()).nullish(),
  /** the ids and partial Message objects */
  messages: z
    .record(
      snowflake,
      z.lazy(() => messageSchema.partial())
    )
    .nullish(),
  /** the ids and attachment objects */
  attachments: z.record(snowflake, attachmentSchema).nullish()
});

export type ResolvedData = z.infer<typeof resolvedDataSchema>;
