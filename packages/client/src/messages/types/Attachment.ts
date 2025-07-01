import { asInteger, snowflake } from "@discordkit/core";
import {
  object,
  string,
  nonEmpty,
  base64,
  nullish,
  exactOptional,
  number,
  integer,
  url,
  minValue,
  boolean,
  type InferOutput,
  pipe,
  type GenericSchema
} from "valibot";
import { attachmentFlag } from "./AttachmentFlags.js";

export const attachmentSchema = object({
  /** attachment id */
  id: snowflake as GenericSchema<string>,
  /** name of file attached */
  filename: pipe(string(), nonEmpty()) as GenericSchema<string>,
  /** the title of the file */
  title: exactOptional<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** description for the file */
  description: exactOptional<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** the attachment's media type */
  contentType: exactOptional<GenericSchema<string>>(pipe(string(), nonEmpty())),
  /** size of file in bytes */
  size: pipe(number(), integer(), minValue(0)) as GenericSchema<number>,
  /** source url of file */
  url: pipe(string(), url()) as GenericSchema<string>,
  /** a proxied url of file */
  proxyUrl: pipe(string(), url()) as GenericSchema<string>,
  /** height of file (if image) */
  height: nullish<GenericSchema<number>>(
    pipe(number(), integer(), minValue(0))
  ),
  /** 	width of file (if image) */
  width: nullish<GenericSchema<number>>(pipe(number(), integer(), minValue(0))),
  /** whether this attachment is ephemeral */
  ephemeral: exactOptional(boolean()),
  /** the duration of the audio file (currently for voice messages) */
  durationSecs: exactOptional<GenericSchema<number>>(
    pipe(number(), minValue(0))
  ),
  /** base64 encoded bytearray representing a sampled waveform (currently for voice messages) */
  waveform: exactOptional<GenericSchema<string>>(pipe(string(), base64())),
  /** attachment flags combined as a bitfield */
  flags: exactOptional(asInteger(attachmentFlag) as GenericSchema<number>)
});

export interface Attachment extends InferOutput<typeof attachmentSchema> {}
