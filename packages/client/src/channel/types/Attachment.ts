import { snowflake } from "@discordkit/core";
import { z } from "zod";

export const attachmentSchema = z.object({
  /** attachment id */
  id: snowflake,
  /** name of file attached */
  filename: z.string().min(1),
  /** description for the file */
  description: z.string().nullish(),
  /** the attachment's media type */
  contentType: z.string().nullish(),
  /** size of file in bytes */
  size: z.number().int(),
  /** source url of file */
  url: z.string().url(),
  /** a proxied url of file */
  proxyUrl: z.string().url(),
  /** height of file (if image) */
  height: z.number().int().positive().nullish(),
  /** 	width of file (if image) */
  width: z.number().int().positive().nullish(),
  /** whether this attachment is ephemeral */
  ephemeral: z.boolean().nullish(),
  /** the duration of the audio file (currently for voice messages) */
  durationSecs: z.number().positive().nullish(),
  /** base64 encoded bytearray representing a sampled waveform (currently for voice messages) */
  waveform: z.string().nullish(),
  /** attachment flags combined as a bitfield */
  flags: z.number().int().nullish()
});

export type Attachment = z.infer<typeof attachmentSchema>;
