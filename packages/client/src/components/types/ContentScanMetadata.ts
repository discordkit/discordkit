import * as v from "valibot";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { contentScanMetadataFlag } from "./ContentScanMetadataFlags.js";

/**
 * ### [Content Scan Metadata](https://discord.com/developers/docs/components/reference#unfurled-media-item-content-scan-metadata-structure)
 *
 * > [!WARNING]
 * >
 * > Content scanning can run after the message is sent, so `contentScanMetadata` may not be present on the initial message and can be added later in a Message Update event.
 * >
 * > If your app reposts media from users, check the flags on the message you send and in any later Message Update event, and take action, like deleting the message, if the media was flagged.
 */
export const contentScanMetadataSchema = v.object({
  /** {@link ContentScanMetadataFlags | Content scan metadata flags} combined as a bitfield */
  flags: asInteger(contentScanMetadataFlag) as v.GenericSchema<number>
});

export interface ContentScanMetadata extends v.InferOutput<
  typeof contentScanMetadataSchema
> {}
