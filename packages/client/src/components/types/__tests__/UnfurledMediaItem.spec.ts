import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { unfurledMediaItemSchema } from "../UnfurledMediaItem.js";

describe(`unfurledMediaItemSchema`, () => {
  it(`takes an externally hosted image without an attachment id`, () => {
    // `attachmentId` is response-only and present only when the media was
    // uploaded as an attachment, so requiring it made every
    // externally-hosted image unrepresentable.
    expect(
      v.safeParse(unfurledMediaItemSchema, {
        url: `https://cdn.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png`
      }).success
    ).toBe(true);
  });
});
