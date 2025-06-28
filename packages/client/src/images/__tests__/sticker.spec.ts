import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { sticker, stickerImageSchema } from "../sticker.js";

describe(`sticker`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        sticker(mockUtils.schema(stickerImageSchema))
      )
    ).not.toThrow();
  });
});
