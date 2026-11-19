import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { ContentScanMetadataFlags } from "../ContentScanMetadataFlags.js";
import { unfurledMediaItemSchema } from "../UnfurledMediaItem.js";

describe(`unfurledMediaItemSchema content scanning`, () => {
  it(`keeps the scan result Discord attaches to a media item`, () => {
    // Component media has no attachment flags of its own, so this object is the only place a flagged image in a media gallery or thumbnail is reported.
    const contentScanMetadata = {
      flags:
        ContentScanMetadataFlags.IS_EXPLICIT_CONTENT |
        ContentScanMetadataFlags.IS_SELF_HARM_CONTENT
    };

    expect(
      v.parse(unfurledMediaItemSchema, {
        url: `https://cdn.discordapp.com/attachments/1/2/image.png`,
        contentScanMetadata
      })
    ).toMatchObject({ contentScanMetadata });
  });
});
