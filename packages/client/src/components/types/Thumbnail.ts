import * as v from "valibot";
import { boundedInteger, boundedString } from "@discordkit/core";
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
export const thumbnailSchema = v.object({
  /** `11` for thumbnail component */
  type: v.literal(ComponentType.Thumbnail),
  /** Optional identifier for component */
  id: v.exactOptional(boundedInteger()),
  /** A url or attachment */
  media: unfurledMediaItemSchema,
  /** Alt text for the media, max 1024 characters */
  description: v.exactOptional(boundedString({ max: 1024 })),
  /** Whether the thumbnail should be a spoiler (or blurred out). Defaults to false */
  spoiler: v.exactOptional(v.boolean())
});

export interface Thumbnail extends v.InferOutput<typeof thumbnailSchema> {}
