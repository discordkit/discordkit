import { snowflake } from "@discordkit/core";
import type { InferOutput } from "valibot";
import {
  exactOptional,
  integer,
  minValue,
  nonEmpty,
  nullish,
  number,
  object,
  pipe,
  string,
  url
} from "valibot";

export const unfurledMediaItemSchema = object({
  /** Supports arbitrary urls and `attachment://<filename>` references */
  url: pipe(string(), url()),
  /** The proxied url of the media item. This field is ignored and provided by the API as part of the response */
  proxyUrl: exactOptional(pipe(string(), url())),
  /** The height of the media item. This field is ignored and provided by the API as part of the response */
  height: nullish(pipe(number(), integer(), minValue(1))),
  /** The width of the media item. This field is ignored and provided by the API as part of the response */
  width: nullish(pipe(number(), integer(), minValue(1))),
  /** The [media type](https://en.wikipedia.org/wiki/Media_type) of the content. This field is ignored and provided by the API as part of the response */
  contentType: exactOptional(pipe(string(), nonEmpty())),
  /** The id of the uploaded attachment. This field is ignored and provided by the API as part of the response (Only present if the media item was uploaded as an attachment.) */
  attachmentId: snowflake
});

export interface UnfurledMediaItem
  extends InferOutput<typeof unfurledMediaItemSchema> {}
