import * as v from "valibot";
import { embedTypeSchema } from "./EmbedType.js";

export const embedSchema = v.partial(
  v.object({
    /** title of embed */
    title: v.pipe(v.string(), v.maxLength(256)) as v.GenericSchema<string>,
    /** type of embed (always "rich" for webhook embeds) */
    type: embedTypeSchema,
    /** description of embed */
    description: v.pipe(
      v.string(),
      v.maxLength(4096)
    ) as v.GenericSchema<string>,
    /** url of embed */
    url: v.pipe(v.string(), v.url()) as v.GenericSchema<string>,
    /** timestamp of embed content */
    timestamp: v.pipe(v.string(), v.isoTimestamp()) as v.GenericSchema<string>,
    /** color code of the embed */
    color: v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0x000000),
      v.maxValue(0xffffff)
    ) as v.GenericSchema<number>,
    /** footer information */
    footer: v.object({
      /** footer text */
      text: v.pipe(
        v.string(),
        v.nonEmpty(),
        v.maxLength(2048)
      ) as v.GenericSchema<string>,
      /** url of footer icon (only supports http(s) and attachments) */
      iconUrl: v.exactOptional<v.GenericSchema<string>>(
        v.pipe(v.string(), v.url())
      ),
      /**	a proxied url of footer icon */
      proxyIconUrl: v.exactOptional<v.GenericSchema<string>>(
        v.pipe(v.string(), v.url())
      )
    }),
    /** image information */
    image: v.object({
      /** source url of image (only supports http(s) and attachments) */
      url: v.pipe(v.string(), v.url()) as v.GenericSchema<string>,
      /** a proxied url of the image */
      proxyUrl: v.exactOptional<v.GenericSchema<string>>(
        v.pipe(v.string(), v.url())
      ),
      /** height of image */
      height: v.exactOptional<v.GenericSchema<number>>(
        v.pipe(v.number(), v.integer(), v.minValue(0))
      ),
      /** width of image */
      width: v.exactOptional<v.GenericSchema<number>>(
        v.pipe(v.number(), v.integer(), v.minValue(0))
      )
    }),
    /** thumbnail information */
    thumbnail: v.object({
      /** source url of thumbnail (only supports http(s) and attachments) */
      url: v.pipe(v.string(), v.url()) as v.GenericSchema<string>,
      /** a proxied url of the thumbnail */
      proxyUrl: v.exactOptional<v.GenericSchema<string>>(
        v.pipe(v.string(), v.url())
      ),
      /** height of thumbnail */
      height: v.exactOptional<v.GenericSchema<number>>(
        v.pipe(v.number(), v.integer(), v.minValue(0))
      ),
      /** width of thumbnail */
      width: v.exactOptional<v.GenericSchema<number>>(
        v.pipe(v.number(), v.integer(), v.minValue(0))
      )
    }),
    /** video information */
    video: v.partial(
      v.object({
        /** source url of video */
        url: v.pipe(v.string(), v.url()) as v.GenericSchema<string>,
        /** a proxied url of the video */
        proxyUrl: v.pipe(v.string(), v.url()) as v.GenericSchema<string>,
        /** height of video */
        height: v.pipe(
          v.number(),
          v.integer(),
          v.minValue(0)
        ) as v.GenericSchema<number>,
        /** width of video */
        width: v.pipe(
          v.number(),
          v.integer(),
          v.minValue(0)
        ) as v.GenericSchema<number>
      })
    ),
    /** provider information */
    provider: v.partial(
      v.object({
        /** name of provider */
        name: v.pipe(v.string(), v.nonEmpty()) as v.GenericSchema<string>,
        /** url of provider */
        url: v.pipe(v.string(), v.url()) as v.GenericSchema<string>
      })
    ),
    /** author information */
    author: v.object({
      /** name of author */
      name: v.pipe(
        v.string(),
        v.nonEmpty(),
        v.maxLength(256)
      ) as v.GenericSchema<string>,
      /** url of author */
      url: v.exactOptional<v.GenericSchema<string>>(
        v.pipe(v.string(), v.url())
      ),
      /** url of author icon (only supports http(s) and attachments) */
      iconUrl: v.exactOptional<v.GenericSchema<string>>(
        v.pipe(v.string(), v.url())
      ),
      /** a proxied url of author icon */
      proxyIconUrl: v.exactOptional<v.GenericSchema<string>>(
        v.pipe(v.string(), v.url())
      )
    }),
    /** fields information */
    fields: v.pipe(
      v.array(
        v.object({
          /** name of the field */
          name: v.pipe(
            v.string(),
            v.nonEmpty(),
            v.maxLength(256)
          ) as v.GenericSchema<string>,
          /** value of the field */
          value: v.pipe(
            v.string(),
            v.nonEmpty(),
            v.maxLength(1024)
          ) as v.GenericSchema<string>,
          /** whether or not this field should display inline */
          inline: v.exactOptional(v.boolean())
        })
      ),
      v.maxLength(25)
    )
  })
);

export interface Embed extends v.InferOutput<typeof embedSchema> {}
