import * as v from "valibot";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { url } from "@discordkit/core/validations/url";
import { attachmentFlag } from "./AttachmentFlags.js";

const _attachmentSchema = v.object({
  /** attachment id */
  id: snowflake,
  /** name of file attached */
  filename: boundedString(),
  /** the title of the file */
  title: v.exactOptional(boundedString()),
  /** description (alt text) for the file (max 1024 characters) */
  description: v.exactOptional(boundedString()),
  /** the attachment's media type */
  contentType: v.exactOptional(boundedString()),
  /** size of file in bytes */
  size: boundedInteger(),
  /** source url of file */
  url: url,
  /** a proxied url of file */
  proxyUrl: url,
  /** height of file (if image or video) */
  height: v.nullish(boundedInteger()),
  /** width of file (if image or video) */
  width: v.nullish(boundedInteger()),
  /** whether this attachment is ephemeral */
  ephemeral: v.exactOptional(v.boolean()),
  /** the duration of the audio file (currently for voice messages) */
  durationSecs: v.exactOptional(boundedInteger()),
  /** base64 encoded bytearray representing a sampled waveform (currently for voice messages) */
  waveform: v.exactOptional<v.GenericSchema<string>>(
    v.pipe(v.string(), v.base64())
  ),
  /** attachment flags combined as a bitfield */
  flags: v.exactOptional(asInteger(attachmentFlag))
});

export interface Attachment extends v.InferOutput<typeof _attachmentSchema> {}

/**
 * ### [Attachment](https://discord.com/developers/docs/resources/message#attachment-object)
 */
export const attachmentSchema = schema<Attachment>(_attachmentSchema);

const _attachmentRequestSchema = v.object({
  ...v.partial(_attachmentSchema).entries,
  /** whether the attachment should be marked as a spoiler and blurred until clicked, this sets the `IS_SPOILER` attachment flag */
  isSpoiler: v.exactOptional(v.boolean())
});

export interface AttachmentRequest extends Partial<Attachment> {
  isSpoiler?: boolean;
}

/**
 * ### [Attachment Request](https://discord.com/developers/docs/resources/message#attachment-object-attachment-request-structure)
 *
 * This structure is used in Message Create and Edit requests to set which attachments are in the message and provide their metadata.
 *
 * When editing, you must provide the `id` of each file to keep, and you can optionally update the `description` and `isSpoiler` fields of existing attachments.
 */
export const attachmentRequestSchema = schema<AttachmentRequest>(
  _attachmentRequestSchema
);
