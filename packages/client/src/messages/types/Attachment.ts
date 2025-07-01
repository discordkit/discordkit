import * as v from "valibot";
import { asInteger, snowflake } from "@discordkit/core";
import { attachmentFlag } from "./AttachmentFlags.js";

export const attachmentSchema = v.object({
  /** attachment id */
  id: snowflake as v.GenericSchema<string>,
  /** name of file attached */
  filename: v.pipe(v.string(), v.nonEmpty()) as v.GenericSchema<string>,
  /** the title of the file */
  title: v.exactOptional<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  ),
  /** description for the file */
  description: v.exactOptional<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  ),
  /** the attachment's media type */
  contentType: v.exactOptional<v.GenericSchema<string>>(
    v.pipe(v.string(), v.nonEmpty())
  ),
  /** size of file in bytes */
  size: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0)
  ) as v.GenericSchema<number>,
  /** source url of file */
  url: v.pipe(v.string(), v.url()) as v.GenericSchema<string>,
  /** a proxied url of file */
  proxyUrl: v.pipe(v.string(), v.url()) as v.GenericSchema<string>,
  /** height of file (if image) */
  height: v.nullish<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** 	width of file (if image) */
  width: v.nullish<v.GenericSchema<number>>(
    v.pipe(v.number(), v.integer(), v.minValue(0))
  ),
  /** whether this attachment is ephemeral */
  ephemeral: v.exactOptional(v.boolean()),
  /** the duration of the audio file (currently for voice messages) */
  durationSecs: v.exactOptional<v.GenericSchema<number>>(
    v.pipe(v.number(), v.minValue(0))
  ),
  /** base64 encoded bytearray representing a sampled waveform (currently for voice messages) */
  waveform: v.exactOptional<v.GenericSchema<string>>(
    v.pipe(v.string(), v.base64())
  ),
  /** attachment flags combined as a bitfield */
  flags: v.exactOptional(asInteger(attachmentFlag) as v.GenericSchema<number>)
});

export interface Attachment extends v.InferOutput<typeof attachmentSchema> {}
