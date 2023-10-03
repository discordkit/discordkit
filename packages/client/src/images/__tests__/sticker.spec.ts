import { mockSchema } from "test-utils";
import { sticker, stickerImageSchema } from "../sticker.ts";
import { z } from "zod";

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
