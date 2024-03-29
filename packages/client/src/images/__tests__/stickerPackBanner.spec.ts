import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  stickerPackBanner,
  stickerPackBannerSchema
} from "../stickerPackBanner.js";

describe(`stickerPackBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(stickerPackBanner(mockSchema(stickerPackBannerSchema)))
    ).not.toThrow();
  });
});
