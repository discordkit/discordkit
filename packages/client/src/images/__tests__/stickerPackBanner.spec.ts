import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  stickerPackBanner,
  stickerPackBannerSchema
} from "../stickerPackBanner.js";

describe(`stickerPackBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        stickerPackBanner(mockUtils.schema(stickerPackBannerSchema))
      )
    ).not.toThrow();
  });
});
