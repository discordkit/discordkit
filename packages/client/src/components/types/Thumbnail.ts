import type { InferOutput } from "valibot";
import {
  boolean,
  exactOptional,
  integer,
  literal,
  maxLength,
  maxValue,
  minValue,
  nonEmpty,
  number,
  object,
  pipe,
  string
} from "valibot";
import { ComponentType } from "./ComponentType.js";
import { unfurledMediaItemSchema } from "./UnfurledMediaItem.js";

/**
 * A Thumbnail is a content component that is a small image only usable as an accessory in a section. The preview comes from an url or attachment through the unfurled media item structure.
 *
 * Thumbnails are only available in messages as an accessory in a section.
 *
 * > [!NOTE]
 * >
 * > To use this component, you need to send the message flag `1 << 15` (IS_COMPONENTS_V2), which can be activated on a per-message basis.
 */
export const thumbnailSchema = object({
  /** `11` for thumbnail component */
  type: literal(ComponentType.Thumbnail),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** A url or attachment */
  media: unfurledMediaItemSchema,
  /** Alt text for the media, max 1024 characters */
  description: exactOptional(pipe(string(), nonEmpty(), maxLength(1024))),
  /** Whether the thumbnail should be a spoiler (or blurred out). Defaults to false */
  spoiler: exactOptional(boolean())
});

export interface Thumbnail extends InferOutput<typeof thumbnailSchema> {}
