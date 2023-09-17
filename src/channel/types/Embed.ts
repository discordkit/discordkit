import { z } from "zod";
import { embedType } from "./EmbedType";

export const embed = z
  .object({
    /** title of embed */
    title: z.string(),
    /** type of embed (always "rich" for webhook embeds) */
    type: embedType,
    /** description of embed */
    description: z.string(),
    /** url of embed */
    url: z.string(),
    /** timestamp of embed content */
    timestamp: z.string(),
    /** color code of the embed */
    color: z.number(),
    /** footer information */
    footer: z.object({
      /** footer text */
      text: z.string(),
      /** url of footer icon (only supports http(s) and attachments) */
      iconUrl: z.string().optional(),
      /**	a proxied url of footer icon */
      proxyIconUrl: z.string().optional()
    }),
    /** image information */
    image: z.object({
      /** source url of image (only supports http(s) and attachments) */
      url: z.string(),
      /** a proxied url of the image */
      proxyUrl: z.string().optional(),
      /** height of image */
      height: z.number().optional(),
      /** width of image */
      width: z.number().optional()
    }),
    /** thumbnail information */
    thumbnail: z.object({
      /** source url of thumbnail (only supports http(s) and attachments) */
      url: z.string(),
      /** a proxied url of the thumbnail */
      proxyUrl: z.string().optional(),
      /** height of thumbnail */
      height: z.number().optional(),
      /** width of thumbnail */
      width: z.number().optional()
    }),
    /** video information */
    video: z.object({
      /** source url of video */
      url: z.string(),
      /** a proxied url of the video */
      proxyUrl: z.string().optional(),
      /** height of video */
      height: z.number().optional(),
      /** width of video */
      width: z.number().optional()
    }),
    /** provider information */
    provider: z
      .object({
        /** name of provider */
        name: z.string(),
        /** url of provider */
        url: z.string()
      })
      .partial(),
    /** author information */
    author: z.object({
      /** name of author */
      name: z.string(),
      /** url of author */
      url: z.string().optional(),
      /** url of author icon (only supports http(s) and attachments) */
      iconUrl: z.string().optional(),
      /** a proxied url of author icon */
      proxyIconUrl: z.string().optional()
    }),
    /** fields information */
    fields: z
      .object({
        /** name of the field */
        name: z.string(),
        /** value of the field */
        value: z.string(),
        /** whether or not this field should display inline */
        inline: z.boolean().optional()
      })
      .array()
  })
  .partial();

export type Embed = z.infer<typeof embed>;
