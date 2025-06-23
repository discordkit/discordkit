import { snowflake } from "@discordkit/core";
import {
  object,
  string,
  minLength,
  nullish,
  number,
  integer,
  url,
  minValue,
  boolean,
  type InferOutput,
  pipe
} from "valibot";

export const attachmentSchema = object({
  /** attachment id */
  id: snowflake,
  /** name of file attached */
  filename: pipe(string(), minLength(1)),
  /** description for the file */
  description: nullish(string()),
  /** the attachment's media type */
  contentType: nullish(string()),
  /** size of file in bytes */
  size: pipe(number(), integer()),
  /** source url of file */
  url: pipe(string(), url()),
  /** a proxied url of file */
  proxyUrl: pipe(string(), url()),
  /** height of file (if image) */
  height: nullish(pipe(number(), integer(), minValue(0))),
  /** 	width of file (if image) */
  width: nullish(pipe(number(), integer(), minValue(0))),
  /** whether this attachment is ephemeral */
  ephemeral: nullish(boolean()),
  /** the duration of the audio file (currently for voice messages) */
  durationSecs: nullish(pipe(number(), minValue(0))),
  /** base64 encoded bytearray representing a sampled waveform (currently for voice messages) */
  waveform: nullish(string()),
  /** attachment flags combined as a bitfield */
  flags: nullish(pipe(number(), integer()))
});

export type Attachment = InferOutput<typeof attachmentSchema>;
