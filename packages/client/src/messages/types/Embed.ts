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
  nonEmpty,
  type GenericSchema
} from "valibot";
import { embedTypeSchema } from "./EmbedType.js";

export const embedSchema = partial(
  object({
    /** title of embed */
    title: pipe(string(), maxLength(256)) as GenericSchema<string>,
    /** type of embed (always "rich" for webhook embeds) */
    type: embedTypeSchema,
    /** description of embed */
    description: pipe(string(), maxLength(4096)) as GenericSchema<string>,
    /** url of embed */
    url: pipe(string(), url()) as GenericSchema<string>,
    /** timestamp of embed content */
    timestamp: pipe(string(), isoTimestamp()) as GenericSchema<string>,
    /** color code of the embed */
    color: pipe(
      number(),
      integer(),
      minValue(0x000000),
      maxValue(0xffffff)
    ) as GenericSchema<number>,
    /** footer information */
    footer: object({
      /** footer text */
      text: pipe(
        string(),
        nonEmpty(),
        maxLength(2048)
      ) as GenericSchema<string>,
      /** url of footer icon (only supports http(s) and attachments) */
      iconUrl: exactOptional<GenericSchema<string>>(pipe(string(), url())),
      /**	a proxied url of footer icon */
      proxyIconUrl: exactOptional<GenericSchema<string>>(pipe(string(), url()))
    }),
    /** image information */
    image: object({
      /** source url of image (only supports http(s) and attachments) */
      url: pipe(string(), url()) as GenericSchema<string>,
      /** a proxied url of the image */
      proxyUrl: exactOptional<GenericSchema<string>>(pipe(string(), url())),
      /** height of image */
      height: exactOptional<GenericSchema<number>>(
        pipe(number(), integer(), minValue(0))
      ),
      /** width of image */
      width: exactOptional<GenericSchema<number>>(
        pipe(number(), integer(), minValue(0))
      )
    }),
    /** thumbnail information */
    thumbnail: object({
      /** source url of thumbnail (only supports http(s) and attachments) */
      url: pipe(string(), url()) as GenericSchema<string>,
      /** a proxied url of the thumbnail */
      proxyUrl: exactOptional<GenericSchema<string>>(pipe(string(), url())),
      /** height of thumbnail */
      height: exactOptional<GenericSchema<number>>(
        pipe(number(), integer(), minValue(0))
      ),
      /** width of thumbnail */
      width: exactOptional<GenericSchema<number>>(
        pipe(number(), integer(), minValue(0))
      )
    }),
    /** video information */
    video: partial(
      object({
        /** source url of video */
        url: pipe(string(), url()) as GenericSchema<string>,
        /** a proxied url of the video */
        proxyUrl: pipe(string(), url()) as GenericSchema<string>,
        /** height of video */
        height: pipe(number(), integer(), minValue(0)) as GenericSchema<number>,
        /** width of video */
        width: pipe(number(), integer(), minValue(0)) as GenericSchema<number>
      })
    ),
    /** provider information */
    provider: partial(
      object({
        /** name of provider */
        name: pipe(string(), nonEmpty()) as GenericSchema<string>,
        /** url of provider */
        url: pipe(string(), url()) as GenericSchema<string>
      })
    ),
    /** author information */
    author: object({
      /** name of author */
      name: pipe(string(), nonEmpty(), maxLength(256)) as GenericSchema<string>,
      /** url of author */
      url: exactOptional<GenericSchema<string>>(pipe(string(), url())),
      /** url of author icon (only supports http(s) and attachments) */
      iconUrl: exactOptional<GenericSchema<string>>(pipe(string(), url())),
      /** a proxied url of author icon */
      proxyIconUrl: exactOptional<GenericSchema<string>>(pipe(string(), url()))
    }),
    /** fields information */
    fields: pipe(
      array(
        object({
          /** name of the field */
          name: pipe(
            string(),
            nonEmpty(),
            maxLength(256)
          ) as GenericSchema<string>,
          /** value of the field */
          value: pipe(
            string(),
            nonEmpty(),
            maxLength(1024)
          ) as GenericSchema<string>,
          /** whether or not this field should display inline */
          inline: exactOptional(boolean())
        })
      ),
      maxLength(25)
    )
  })
);

export interface Embed extends InferOutput<typeof embedSchema> {}
