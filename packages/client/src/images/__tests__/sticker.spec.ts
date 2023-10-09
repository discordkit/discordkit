import { mockSchema } from "test-utils";
import { parse, string, url } from "valibot";
import { sticker, stickerImageSchema } from "../sticker.js";

describe(`sticker`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), sticker(mockSchema(stickerImageSchema)))
    ).not.toThrow();
  });
});
