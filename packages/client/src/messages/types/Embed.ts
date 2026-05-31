import * as v from "valibot";
import {
  schema,
  timestamp,
  boundedArray,
  boundedInteger,
  boundedString,
  url
} from "@discordkit/core";
import { embedTypeSchema } from "./EmbedType.js";

const _embedFooterSchema = v.object({
  /** footer text */
  text: boundedString({ max: 2048 }),
  /** url of footer icon (only supports http(s) and attachments) */
  iconUrl: v.exactOptional(url),
  /** a proxied url of footer icon */
  proxyIconUrl: v.exactOptional(url)
});

export interface EmbedFooter extends v.InferOutput<typeof _embedFooterSchema> {}

/**
 * ### [Embed Footer](https://discord.com/developers/docs/resources/message#embed-object-embed-footer-structure)
 */
export const embedFooterSchema = schema<EmbedFooter>(_embedFooterSchema);

const _embedImageSchema = v.object({
  /** source url of image (only supports http(s) and attachments) */
  url,
  /** a proxied url of the image */
  proxyUrl: v.exactOptional(url),
  /** height of image */
  height: v.exactOptional(boundedInteger()),
  /** width of image */
  width: v.exactOptional(boundedInteger())
});

export interface EmbedImage extends v.InferOutput<typeof _embedImageSchema> {}

/**
 * ### [Embed Image](https://discord.com/developers/docs/resources/message#embed-object-embed-image-structure)
 */
export const embedImageSchema = schema<EmbedImage>(_embedImageSchema);

const _embedThumbnailSchema = v.object({
  /** source url of thumbnail (only supports http(s) and attachments) */
  url,
  /** a proxied url of the thumbnail */
  proxyUrl: v.exactOptional(url),
  /** height of thumbnail */
  height: v.exactOptional(boundedInteger()),
  /** width of thumbnail */
  width: v.exactOptional(boundedInteger())
});

export interface EmbedThumbnail extends v.InferOutput<
  typeof _embedThumbnailSchema
> {}

/**
 * ### [Embed Thumbnail](https://discord.com/developers/docs/resources/message#embed-object-embed-thumbnail-structure)
 */
export const embedThumbnailSchema = schema<EmbedThumbnail>(
  _embedThumbnailSchema
);

const _embedVideoSchema = v.object({
  /** source url of video */
  url: v.exactOptional(url),
  /** a proxied url of the video */
  proxyUrl: v.exactOptional(url),
  /** height of video */
  height: v.exactOptional(boundedInteger()),
  /** width of video */
  width: v.exactOptional(boundedInteger())
});

export interface EmbedVideo extends v.InferOutput<typeof _embedVideoSchema> {}

/**
 * ### [Embed Video](https://discord.com/developers/docs/resources/message#embed-object-embed-video-structure)
 */
export const embedVideoSchema = schema<EmbedVideo>(_embedVideoSchema);

const _embedProviderSchema = v.object({
  /** name of provider */
  name: v.exactOptional(boundedString()),
  /** url of provider */
  url: v.exactOptional(url)
});

export interface EmbedProvider extends v.InferOutput<
  typeof _embedProviderSchema
> {}

/**
 * ### [Embed Provider](https://discord.com/developers/docs/resources/message#embed-object-embed-provider-structure)
 */
export const embedProviderSchema = schema<EmbedProvider>(_embedProviderSchema);

const _embedAuthorSchema = v.object({
  /** name of author */
  name: boundedString({ max: 256 }),
  /** url of author */
  url: v.exactOptional(url),
  /** url of author icon (only supports http(s) and attachments) */
  iconUrl: v.exactOptional(url),
  /** a proxied url of author icon */
  proxyIconUrl: v.exactOptional(url)
});

export interface EmbedAuthor extends v.InferOutput<typeof _embedAuthorSchema> {}

/**
 * ### [Embed Author](https://discord.com/developers/docs/resources/message#embed-object-embed-author-structure)
 */
export const embedAuthorSchema = schema<EmbedAuthor>(_embedAuthorSchema);

const _embedFieldSchema = v.object({
  /** name of the field */
  name: boundedString({ max: 256 }),
  /** value of the field */
  value: boundedString({ max: 1024 }),
  /** whether or not this field should display inline */
  inline: v.exactOptional(v.boolean())
});

export interface EmbedField extends v.InferOutput<typeof _embedFieldSchema> {}

/**
 * ### [Embed Field](https://discord.com/developers/docs/resources/message#embed-object-embed-field-structure)
 */
export const embedFieldSchema = schema<EmbedField>(_embedFieldSchema);

export const embedEntries = {
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
  footer: embedFooterSchema,
  /** image information */
  image: embedImageSchema,
  /** thumbnail information */
  thumbnail: embedThumbnailSchema,
  /** video information */
  video: embedVideoSchema,
  /** provider information */
  provider: embedProviderSchema,
  /** author information */
  author: embedAuthorSchema,
  /** fields information, max of 25 */
  fields: boundedArray(embedFieldSchema, { max: 25 })
} as const;

const _embedSchema = v.partial(v.object(embedEntries));

export interface Embed extends v.InferOutput<typeof _embedSchema> {}

/**
 * ### [Embed](https://discord.com/developers/docs/resources/message#embed-object)
 */
export const embedSchema = schema<Embed>(_embedSchema);
