import {
  object,
  partial,
  string,
  maxLength,
  nullish,
  isoTimestamp,
  number,
  integer,
  minValue,
  url,
  array,
  boolean,
  type InferOutput,
  pipe
} from "valibot";
import { embedTypeSchema } from "./EmbedType.js";

export const embedSchema = partial(
  object({
    /** title of embed */
    title: nullish(pipe(string(), maxLength(256))),
    /** type of embed (always "rich" for webhook embeds) */
    type: nullish(embedTypeSchema),
    /** description of embed */
    description: nullish(pipe(string(), maxLength(4096))),
    /** url of embed */
    url: nullish(pipe(string(), url())),
    /** timestamp of embed content */
    timestamp: nullish(pipe(string(), isoTimestamp())),
    /** color code of the embed */
    color: nullish(pipe(number(), integer())),
    /** footer information */
    footer: nullish(
      object({
        /** footer text */
        text: pipe(string(), maxLength(2048)),
        /** url of footer icon (only supports http(s) and attachments) */
        iconUrl: nullish(pipe(string(), url())),
        /**	a proxied url of footer icon */
        proxyIconUrl: nullish(pipe(string(), url()))
      })
    ),
    /** image information */
    image: nullish(
      object({
        /** source url of image (only supports http(s) and attachments) */
        url: pipe(string(), url()),
        /** a proxied url of the image */
        proxyUrl: nullish(pipe(string(), url())),
        /** height of image */
        height: nullish(pipe(number(), integer(), minValue(0))),
        /** width of image */
        width: nullish(pipe(number(), integer(), minValue(0)))
      })
    ),
    /** thumbnail information */
    thumbnail: nullish(
      object({
        /** source url of thumbnail (only supports http(s) and attachments) */
        url: pipe(string(), url()),
        /** a proxied url of the thumbnail */
        proxyUrl: nullish(pipe(string(), url())),
        /** height of thumbnail */
        height: nullish(pipe(number(), integer(), minValue(0))),
        /** width of thumbnail */
        width: nullish(pipe(number(), integer(), minValue(0)))
      })
    ),
    /** video information */
    video: nullish(
      object({
        /** source url of video */
        url: pipe(string(), url()),
        /** a proxied url of the video */
        proxyUrl: nullish(pipe(string(), url())),
        /** height of video */
        height: nullish(pipe(number(), integer(), minValue(0))),
        /** width of video */
        width: nullish(pipe(number(), integer(), minValue(0)))
      })
    ),
    /** provider information */
    provider: nullish(
      object({
        /** name of provider */
        name: nullish(string()),
        /** url of provider */
        url: nullish(pipe(string(), url()))
      })
    ),
    /** author information */
    author: nullish(
      object({
        /** name of author */
        name: pipe(string(), maxLength(256)),
        /** url of author */
        url: nullish(pipe(string(), url())),
        /** url of author icon (only supports http(s) and attachments) */
        iconUrl: nullish(pipe(string(), url())),
        /** a proxied url of author icon */
        proxyIconUrl: nullish(pipe(string(), url()))
      })
    ),
    /** fields information */
    fields: nullish(
      pipe(
        array(
          object({
            /** name of the field */
            name: pipe(string(), maxLength(256)),
            /** value of the field */
            value: pipe(string(), maxLength(1024)),
            /** whether or not this field should display inline */
            inline: nullish(boolean())
          })
        ),
        maxLength(25)
      )
    )
  })
);

export type Embed = InferOutput<typeof embedSchema>;
