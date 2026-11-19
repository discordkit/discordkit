/* oxlint-disable @typescript-eslint/prefer-literal-enum-member */
import * as v from "valibot";
import { bitfield } from "@discordkit/core/validations/bitfield";

/**
 * ### [Content Scan Metadata Flags](https://discord.com/developers/docs/components/reference#unfurled-media-item-content-scan-metadata-flags)
 */
export enum ContentScanMetadataFlags {
  /** This media was flagged as explicit by Discord's content scanning */
  IS_EXPLICIT_CONTENT = 1 << 0,
  /** This media was flagged as gore by Discord's content scanning */
  IS_GORE_CONTENT = 1 << 1,
  /** This media was flagged as self-harm by Discord's content scanning */
  IS_SELF_HARM_CONTENT = 1 << 2
}

export const contentScanMetadataFlagsSchema = v.enum_(ContentScanMetadataFlags);
export const contentScanMetadataFlag = bitfield(
  `contentScanMetadataFlag`,
  ContentScanMetadataFlags,
  `Invalid Content Scan Metadata Flag`
);
