import { z } from "zod";
import { userSchema } from "../../user/types/User";
import { memberSchema } from "../../guild/types/Member";
import { roleSchema } from "../../guild/types/Role";
import { attachmentSchema } from "../../channel/types/Attachment";
import { channelSchema } from "../../channel/types/Channel";
import { messageSchema } from "../../channel/types/Message";

export const resolvedDataSchema = z.object({
  /** the ids and User objects */
  users: z.record(z.string().min(1), userSchema).nullable(),
  /** the ids and partial Member objects */
  members: z.record(z.string().min(1), memberSchema.partial()).nullable(),
  /** the ids and Role objects */
  roles: z.record(z.string().min(1), roleSchema).nullable(),
  /** the ids and partial Channel objects */
  channels: z.record(z.string().min(1), channelSchema.partial()).nullable(),
  /** the ids and partial Message objects */
  messages: z
    .record(
      z.string().min(1),
      z.lazy(() => messageSchema.partial())
    )
    .nullable(),
  /** the ids and attachment objects */
  attachments: z.record(z.string().min(1), attachmentSchema).nullable()
});

export type ResolvedData = z.infer<typeof resolvedDataSchema>;
