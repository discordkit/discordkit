import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import {
  stickerPackBanner,
  stickerPackBannerSchema
} from "../stickerPackBanner.js";

describe(`stickerPackBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        stickerPackBanner(mockSchema(stickerPackBannerSchema))
      )
    ).not.toThrow();
  });
});
