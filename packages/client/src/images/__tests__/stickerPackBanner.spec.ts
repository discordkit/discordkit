import { mockSchema } from "test-utils";
import {
  stickerPackBanner,
  stickerPackBannerSchema
} from "../stickerPackBanner.ts";
import { z } from "zod";

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
