import * as v from "valibot";
import {
  boundedString,
  boundedInteger,
  url,
  snowflake
} from "@discordkit/core";

export const unfurledMediaItemSchema = v.object({
  /** Supports arbitrary urls and `attachment://<filename>` references */
  url: url,
  /** The proxied url of the media item. This field is ignored and provided by the API as part of the response */
  proxyUrl: v.exactOptional(url),
  /** The height of the media item. This field is ignored and provided by the API as part of the response */
  height: v.nullish(boundedInteger()),
  /** The width of the media item. This field is ignored and provided by the API as part of the response */
  width: v.nullish(boundedInteger()),
  /** The [media type](https://en.wikipedia.org/wiki/Media_type) of the content. This field is ignored and provided by the API as part of the response */
  contentType: v.exactOptional(boundedString()),
  /** The id of the uploaded attachment. This field is ignored and provided by the API as part of the response (Only present if the media item was uploaded as an attachment.) */
  attachmentId: snowflake
});

export interface UnfurledMediaItem
  extends v.InferOutput<typeof unfurledMediaItemSchema> {}
