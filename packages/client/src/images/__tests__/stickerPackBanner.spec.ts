import { mockUtils } from "#mocks";
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
        stickerPackBanner(mockUtils.schema(stickerPackBannerSchema))
      )
    ).not.toThrow();
  });
});
