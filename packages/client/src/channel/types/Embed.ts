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
  type Output
} from "valibot";
import { embedTypeSchema } from "./EmbedType.js";

export const embedSchema = partial(
  object({
    /** title of embed */
    title: nullish(string([maxLength(256)])),
    /** type of embed (always "rich" for webhook embeds) */
    type: nullish(embedTypeSchema),
    /** description of embed */
    description: nullish(string([maxLength(4096)])),
    /** url of embed */
    url: nullish(string([url()])),
    /** timestamp of embed content */
    timestamp: nullish(string([isoTimestamp()])),
    /** color code of the embed */
    color: nullish(number([integer()])),
    /** footer information */
    footer: nullish(
      object({
        /** footer text */
        text: string([maxLength(2048)]),
        /** url of footer icon (only supports http(s) and attachments) */
        iconUrl: nullish(string([url()])),
        /**	a proxied url of footer icon */
        proxyIconUrl: nullish(string([url()]))
      })
    ),
    /** image information */
    image: nullish(
      object({
        /** source url of image (only supports http(s) and attachments) */
        url: string([url()]),
        /** a proxied url of the image */
        proxyUrl: nullish(string([url()])),
        /** height of image */
        height: nullish(number([integer(), minValue(0)])),
        /** width of image */
        width: nullish(number([integer(), minValue(0)]))
      })
    ),
    /** thumbnail information */
    thumbnail: nullish(
      object({
        /** source url of thumbnail (only supports http(s) and attachments) */
        url: string([url()]),
        /** a proxied url of the thumbnail */
        proxyUrl: nullish(string([url()])),
        /** height of thumbnail */
        height: nullish(number([integer(), minValue(0)])),
        /** width of thumbnail */
        width: nullish(number([integer(), minValue(0)]))
      })
    ),
    /** video information */
    video: nullish(
      object({
        /** source url of video */
        url: string([url()]),
        /** a proxied url of the video */
        proxyUrl: nullish(string([url()])),
        /** height of video */
        height: nullish(number([integer(), minValue(0)])),
        /** width of video */
        width: nullish(number([integer(), minValue(0)]))
      })
    ),
    /** provider information */
    provider: nullish(
      object({
        /** name of provider */
        name: nullish(string()),
        /** url of provider */
        url: nullish(string([url()]))
      })
    ),
    /** author information */
    author: nullish(
      object({
        /** name of author */
        name: string([maxLength(256)]),
        /** url of author */
        url: nullish(string([url()])),
        /** url of author icon (only supports http(s) and attachments) */
        iconUrl: nullish(string([url()])),
        /** a proxied url of author icon */
        proxyIconUrl: nullish(string([url()]))
      })
    ),
    /** fields information */
    fields: nullish(
      array(
        object({
          /** name of the field */
          name: string([maxLength(256)]),
          /** value of the field */
          value: string([maxLength(1024)]),
          /** whether or not this field should display inline */
          inline: nullish(boolean())
        }),
        [maxLength(25)]
      )
    )
  })
);

export type Embed = Output<typeof embedSchema>;
