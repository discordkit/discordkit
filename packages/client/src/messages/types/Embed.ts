import {
  object,
  partial,
  string,
  maxLength,
  exactOptional,
  isoTimestamp,
  number,
  integer,
  minValue,
  url,
  array,
  boolean,
  type InferOutput,
  pipe,
  maxValue,
  nonEmpty
} from "valibot";
import { embedTypeSchema } from "./EmbedType.js";

export const embedSchema = partial(
  object({
    /** title of embed */
    title: pipe(string(), maxLength(256)),
    /** type of embed (always "rich" for webhook embeds) */
    type: embedTypeSchema,
    /** description of embed */
    description: pipe(string(), maxLength(4096)),
    /** url of embed */
    url: pipe(string(), url()),
    /** timestamp of embed content */
    timestamp: pipe(string(), isoTimestamp()),
    /** color code of the embed */
    color: pipe(number(), integer(), minValue(0x000000), maxValue(0xffffff)),
    /** footer information */
    footer: object({
      /** footer text */
      text: pipe(string(), nonEmpty(), maxLength(2048)),
      /** url of footer icon (only supports http(s) and attachments) */
      iconUrl: exactOptional(pipe(string(), url())),
      /**	a proxied url of footer icon */
      proxyIconUrl: exactOptional(pipe(string(), url()))
    }),
    /** image information */
    image: object({
      /** source url of image (only supports http(s) and attachments) */
      url: pipe(string(), url()),
      /** a proxied url of the image */
      proxyUrl: exactOptional(pipe(string(), url())),
      /** height of image */
      height: exactOptional(pipe(number(), integer(), minValue(0))),
      /** width of image */
      width: exactOptional(pipe(number(), integer(), minValue(0)))
    }),
    /** thumbnail information */
    thumbnail: object({
      /** source url of thumbnail (only supports http(s) and attachments) */
      url: pipe(string(), url()),
      /** a proxied url of the thumbnail */
      proxyUrl: exactOptional(pipe(string(), url())),
      /** height of thumbnail */
      height: exactOptional(pipe(number(), integer(), minValue(0))),
      /** width of thumbnail */
      width: exactOptional(pipe(number(), integer(), minValue(0)))
    }),
    /** video information */
    video: partial(
      object({
        /** source url of video */
        url: pipe(string(), url()),
        /** a proxied url of the video */
        proxyUrl: pipe(string(), url()),
        /** height of video */
        height: pipe(number(), integer(), minValue(0)),
        /** width of video */
        width: pipe(number(), integer(), minValue(0))
      })
    ),
    /** provider information */
    provider: partial(
      object({
        /** name of provider */
        name: pipe(string(), nonEmpty()),
        /** url of provider */
        url: pipe(string(), url())
      })
    ),
    /** author information */
    author: object({
      /** name of author */
      name: pipe(string(), nonEmpty(), maxLength(256)),
      /** url of author */
      url: exactOptional(pipe(string(), url())),
      /** url of author icon (only supports http(s) and attachments) */
      iconUrl: exactOptional(pipe(string(), url())),
      /** a proxied url of author icon */
      proxyIconUrl: exactOptional(pipe(string(), url()))
    }),
    /** fields information */
    fields: pipe(
      array(
        object({
          /** name of the field */
          name: pipe(string(), nonEmpty(), maxLength(256)),
          /** value of the field */
          value: pipe(string(), nonEmpty(), maxLength(1024)),
          /** whether or not this field should display inline */
          inline: exactOptional(boolean())
        })
      ),
      maxLength(25)
    )
  })
);

export type Embed = InferOutput<typeof embedSchema>;
