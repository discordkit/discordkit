import { z } from "zod";

export const attachmentSchema = z.object({
  /** attachment id */
  id: z.string(),
  /** name of file attached */
  filename: z.string(),
  /** description for the file */
  description: z.string().optional(),
  /** the attachment's media type */
  contentType: z.string(),
  /** size of file in bytes */
  size: z.number(),
  /** source url of file */
  url: z.string(),
  /** a proxied url of file */
  proxyUrl: z.string(),
  /** height of file (if image) */
  height: z.number().optional(),
  /** 	width of file (if image) */
  width: z.number().optional(),
  /** whether this attachment is ephemeral */
  ephemeral: z.boolean().optional()
});

export type Attachment = z.infer<typeof attachmentSchema>;
