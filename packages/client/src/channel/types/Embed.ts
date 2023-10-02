import { z } from "zod";
import { embedTypeSchema } from "./EmbedType.ts";

export const embedSchema = z
  .object({
    /** title of embed */
    title: z.string().max(256).nullish(),
    /** type of embed (always "rich" for webhook embeds) */
    type: embedTypeSchema.nullish(),
    /** description of embed */
    description: z.string().max(4096).nullish(),
    /** url of embed */
    url: z.string().nullish(),
    /** timestamp of embed content */
    timestamp: z.string().datetime().nullish(),
    /** color code of the embed */
    color: z.number().int().nullish(),
    /** footer information */
    footer: z
      .object({
        /** footer text */
        text: z.string().max(2048),
        /** url of footer icon (only supports http(s) and attachments) */
        iconUrl: z.string().url().nullish(),
        /**	a proxied url of footer icon */
        proxyIconUrl: z.string().url().nullish()
      })
      .nullish(),
    /** image information */
    image: z
      .object({
        /** source url of image (only supports http(s) and attachments) */
        url: z.string().url(),
        /** a proxied url of the image */
        proxyUrl: z.string().url().nullish(),
        /** height of image */
        height: z.number().int().positive().nullish(),
        /** width of image */
        width: z.number().int().positive().nullish()
      })
      .nullish(),
    /** thumbnail information */
    thumbnail: z
      .object({
        /** source url of thumbnail (only supports http(s) and attachments) */
        url: z.string().url(),
        /** a proxied url of the thumbnail */
        proxyUrl: z.string().url().nullish(),
        /** height of thumbnail */
        height: z.number().int().positive().nullish(),
        /** width of thumbnail */
        width: z.number().int().positive().nullish()
      })
      .nullish(),
    /** video information */
    video: z
      .object({
        /** source url of video */
        url: z.string().url(),
        /** a proxied url of the video */
        proxyUrl: z.string().url().nullish(),
        /** height of video */
        height: z.number().int().positive().nullish(),
        /** width of video */
        width: z.number().int().positive().nullish()
      })
      .nullish(),
    /** provider information */
    provider: z
      .object({
        /** name of provider */
        name: z.string().nullish(),
        /** url of provider */
        url: z.string().url().nullish()
      })
      .nullish(),
    /** author information */
    author: z
      .object({
        /** name of author */
        name: z.string().max(256),
        /** url of author */
        url: z.string().url().nullish(),
        /** url of author icon (only supports http(s) and attachments) */
        iconUrl: z.string().url().nullish(),
        /** a proxied url of author icon */
        proxyIconUrl: z.string().url().nullish()
      })
      .nullish(),
    /** fields information */
    fields: z
      .object({
        /** name of the field */
        name: z.string().max(256),
        /** value of the field */
        value: z.string().max(1024),
        /** whether or not this field should display inline */
        inline: z.boolean().nullish()
      })
      .array()
      .max(25)
      .nullish()
  })
  .partial();

export type Embed = z.infer<typeof embedSchema>;
