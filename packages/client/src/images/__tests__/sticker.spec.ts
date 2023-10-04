import { mockSchema } from "test-utils";
import { z } from "zod";
import { sticker, stickerImageSchema } from "../sticker.js";

describe(`sticker`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(sticker(mockSchema(stickerImageSchema)))
    ).not.toThrow();
  });
});
