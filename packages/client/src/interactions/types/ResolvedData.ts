import * as v from "valibot";
import { snowflake, asDigits, boundedString } from "@discordkit/core";
import type { User } from "../../user/types/User.js";
import { userSchema } from "../../user/types/User.js";
import { memberSchema } from "../../guild/types/Member.js";
import { type Role, roleSchema } from "../../permissions/Role.js";
import {
  type Attachment,
  attachmentSchema
} from "../../messages/types/Attachment.js";
import { type Message, messageSchema } from "../../messages/types/Message.js";
import {
  ChannelType,
  channelTypeSchema
} from "../../channel/types/ChannelType.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { threadMetadataSchema } from "../../channel/types/ThreadMetadata.js";

export const resolvedDataSchema = v.object({
  /** the ids and User objects */
  users: v.exactOptional<v.GenericSchema<Record<string, User>>>(
    v.record(snowflake, userSchema)
  ),
  /** the ids and partial Member objects */
  members: v.exactOptional(
    v.record(
      snowflake,
      v.partial(v.omit(memberSchema, [`user`, `deaf`, `mute`]))
    )
  ),
  /** the ids and Role objects */
  roles: v.exactOptional<v.GenericSchema<Record<string, Role>>>(
    v.record(snowflake, roleSchema)
  ),
  /** the ids and partial Channel objects */
  channels: v.exactOptional(
    v.record(
      snowflake,
      v.intersect([
        v.object({
          /** the id of this channel */
          id: snowflake,
          /** the type of channel */
          type: channelTypeSchema,
          /** the name of the channel (1-100 characters) */
          name: v.nullish(boundedString({ max: 100 })),
          /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
          permissions: asDigits(permissionFlag)
        }),
        v.variant(`type`, [
          v.object({
            type: v.picklist([
              ChannelType.ANNOUNCEMENT_THREAD,
              ChannelType.PRIVATE_THREAD,
              ChannelType.PUBLIC_THREAD
            ]),
            parentId: v.nullish(boundedString({ max: 50 })),
            /** thread-specific fields not needed by other channels */
            threadMetadata: v.exactOptional(threadMetadataSchema)
          }),
          v.object({
            type: channelTypeSchema
          })
        ])
      ])
    )
  ),
  /** the ids and partial Message objects */
  messages: v.exactOptional(
    v.record(
      snowflake,
      v.lazy<v.GenericSchema<Partial<Message>>>(() => v.partial(messageSchema))
    )
  ),
  /** the ids and attachment objects */
  attachments: v.exactOptional<v.GenericSchema<Record<string, Attachment>>>(
    v.record(snowflake, attachmentSchema)
  )
});

export interface ResolvedData
  extends v.InferOutput<typeof resolvedDataSchema> {}
