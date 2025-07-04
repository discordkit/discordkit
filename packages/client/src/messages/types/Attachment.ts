import * as v from "valibot";
import {
  asInteger,
  snowflake,
  boundedString,
  boundedInteger,
  url
} from "@discordkit/core";
import { attachmentFlag } from "./AttachmentFlags.js";

export const attachmentSchema = v.object({
  /** attachment id */
  id: snowflake,
  /** name of file attached */
  filename: boundedString(),
  /** the title of the file */
  title: v.exactOptional(boundedString()),
  /** description for the file */
  description: v.exactOptional(boundedString()),
  /** the attachment's media type */
  contentType: v.exactOptional(boundedString()),
  /** size of file in bytes */
  size: boundedInteger(),
  /** source url of file */
  url: url,
  /** a proxied url of file */
  proxyUrl: url,
  /** height of file (if image) */
  height: v.nullish(boundedInteger()),
  /** 	width of file (if image) */
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

export interface Attachment extends v.InferOutput<typeof attachmentSchema> {}
