import { z } from "zod";

export const attachmentSchema = z.object({
  /** attachment id */
  id: z.string().min(1),
  /** name of file attached */
  filename: z.string().min(1),
  /** description for the file */
  description: z.string().nullable(),
  /** the attachment's media type */
  contentType: z.string().nullable(),
  /** size of file in bytes */
  size: z.number().int(),
  /** source url of file */
  url: z.string().url(),
  /** a proxied url of file */
  proxyUrl: z.string().url(),
  /** height of file (if image) */
  height: z.number().int().positive().nullable().optional(),
  /** 	width of file (if image) */
  width: z.number().int().positive().nullable().optional(),
  /** whether this attachment is ephemeral */
  ephemeral: z.boolean().nullable(),
  /** the duration of the audio file (currently for voice messages) */
  durationSecs: z.number().positive().nullable(),
  /** base64 encoded bytearray representing a sampled waveform (currently for voice messages) */
  waveform: z.string().nullable(),
  /** attachment flags combined as a bitfield */
  flags: z.number().int().nullable()
});

export type Attachment = z.infer<typeof attachmentSchema>;