import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import {
  stickerPackBanner,
  stickerPackBannerSchema
} from "../stickerPackBanner.js";

describe(`stickerPackBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        string([url()]),
        stickerPackBanner(mockSchema(stickerPackBannerSchema))
      )
    ).not.toThrow();
  });
});
