import {
  object,
  record,
  partial,
  lazy,
  exactOptional,
  omit,
  nullish,
  pipe,
  string,
  minLength,
  maxLength,
  intersect,
  variant,
  picklist,
  type InferOutput,
  type GenericSchema
} from "valibot";
import { snowflake, asDigits } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { memberSchema } from "../../guild/types/Member.js";
import { roleSchema } from "../../permissions/Role.js";
import { attachmentSchema } from "../../messages/types/Attachment.js";
import { type Message, messageSchema } from "../../messages/types/Message.js";
import {
  ChannelType,
  channelTypeSchema
} from "../../channel/types/ChannelType.js";
import { permissionFlag } from "../../permissions/Permissions.js";
import { threadMetadataSchema } from "../../channel/types/ThreadMetadata.js";

export const resolvedDataSchema = object({
  /** the ids and User objects */
  users: exactOptional(record(snowflake, userSchema)),
  /** the ids and partial Member objects */
  members: exactOptional(
    record(snowflake, partial(omit(memberSchema, [`user`, `deaf`, `mute`])))
  ),
  /** the ids and Role objects */
  roles: exactOptional(record(snowflake, roleSchema)),
  /** the ids and partial Channel objects */
  channels: exactOptional(
    record(
      snowflake,
      intersect([
        object({
          /** the id of this channel */
          id: snowflake,
          /** the type of channel */
          type: channelTypeSchema,
          /** the name of the channel (1-100 characters) */
          name: nullish(pipe(string(), minLength(1), maxLength(100))),
          /** computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction */
          permissions: asDigits(permissionFlag) as GenericSchema<string>
        }),
        variant(`type`, [
          object({
            type: picklist([
              ChannelType.ANNOUNCEMENT_THREAD,
              ChannelType.PRIVATE_THREAD,
              ChannelType.PUBLIC_THREAD
            ]),
            parentId: nullish(pipe(string(), minLength(1), maxLength(50))),
            /** thread-specific fields not needed by other channels */
            threadMetadata: exactOptional(threadMetadataSchema)
          }),
          object({
            type: channelTypeSchema
          })
        ])
      ])
    )
  ),
  /** the ids and partial Message objects */
  messages: exactOptional(
    record(
      snowflake,
      lazy<GenericSchema<Partial<Message>>>(
        // @ts-expect-error
        () => partial(messageSchema)
      )
    )
  ),
  /** the ids and attachment objects */
  attachments: exactOptional(record(snowflake, attachmentSchema))
});

export type ResolvedData = InferOutput<typeof resolvedDataSchema>;
