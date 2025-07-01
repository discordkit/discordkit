import type { InferOutput } from "valibot";
import {
  literal,
  boolean,
  number,
  integer,
  nonEmpty,
  minValue,
  maxValue,
  exactOptional,
  object,
  pipe,
  string
} from "valibot";
import { unfurledMediaItemSchema } from "./UnfurledMediaItem.js";
import { ComponentType } from "./ComponentType.js";

/**
 * A File is a top-level component that allows you to display an uploaded file as an attachment to the message and reference it in the component. Each file component can only display 1 attached file, but you can upload multiple files and add them to different file components within your payload.
 *
 * Files are only available in messages.
 *
 * > [!NOTE]
 * >
 * > To use this component, you need to send the message flag `1 << 15` (IS_COMPONENTS_V2) which can be activated on a per-message basis.
 */
export const fileSchema = object({
  /** `13` for a file component */
  type: literal(ComponentType.File),
  /** Optional identifier for component */
  id: exactOptional(
    pipe(number(), integer(), minValue(0), maxValue(Number.MAX_SAFE_INTEGER))
  ),
  /** This unfurled media item is unique in that it **only** supports attachment references using the `attachment://<filename>` syntax */
  file: unfurledMediaItemSchema,
  /** Whether the media should be a spoiler (or blurred out). Defaults to `false` */
  spoiler: exactOptional(boolean()),
  /** The name of the file. This field is ignored and provided by the API as part of the response */
  name: pipe(string(), nonEmpty()),
  /** The size of the file in bytes. This field is ignored and provided by the API as part of the response */
  size: pipe(number(), integer())
});

export interface File extends InferOutput<typeof fileSchema> {}
