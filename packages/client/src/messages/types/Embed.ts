import * as v from "valibot";
import {
  timestamp,
  boundedArray,
  boundedInteger,
  boundedString,
  url
} from "@discordkit/core";
import { embedTypeSchema } from "./EmbedType.js";

export const embedSchema = v.partial(
  v.object({
    /** title of embed */
    title: boundedString({ max: 256 }),
    /** type of embed (always "rich" for webhook embeds) */
    type: embedTypeSchema,
    /** description of embed */
    description: boundedString({ max: 4096 }),
    /** url of embed */
    url,
    /** timestamp of embed content */
    timestamp,
    /** color code of the embed */
    color: boundedInteger({ min: 0x000000, max: 0xffffff }),
    /** footer information */
    footer: v.object({
      /** footer text */
      text: boundedString({ max: 2048 }),
      /** url of footer icon (only supports http(s) and attachments) */
      iconUrl: url,
      /**	a proxied url of footer icon */
      proxyIconUrl: url
    }),
    /** image information */
    image: v.object({
      /** source url of image (only supports http(s) and attachments) */
      url,
      /** a proxied url of the image */
      proxyUrl: url,
      /** height of image */
      height: boundedInteger(),
      /** width of image */
      width: boundedInteger()
    }),
    /** thumbnail information */
    thumbnail: v.object({
      /** source url of thumbnail (only supports http(s) and attachments) */
      url,
      /** a proxied url of the thumbnail */
      proxyUrl: url,
      /** height of thumbnail */
      height: boundedInteger(),
      /** width of thumbnail */
      width: boundedInteger()
    }),
    /** video information */
    video: v.partial(
      v.object({
        /** source url of video */
        url,
        /** a proxied url of the video */
        proxyUrl: url,
        /** height of video */
        height: boundedInteger(),
        /** width of video */
        width: boundedInteger()
      })
    ),
    /** provider information */
    provider: v.partial(
      v.object({
        /** name of provider */
        name: boundedString(),
        /** url of provider */
        url
      })
    ),
    /** author information */
    author: v.object({
      /** name of author */
      name: boundedString({ max: 256 }),
      /** url of author */
      url: url,
      /** url of author icon (only supports http(s) and attachments) */
      iconUrl: url,
      /** a proxied url of author icon */
      proxyIconUrl: url
    }),
    /** fields information */
    fields: boundedArray(
      v.object({
        /** name of the field */
        name: boundedString({ max: 256 }),
        /** value of the field */
        value: boundedString({ max: 1024 }),
        /** whether or not this field should display inline */
        inline: v.exactOptional(v.boolean())
      }),
      { max: 25 }
    )
  })
);

export interface Embed extends v.InferOutput<typeof embedSchema> {}
