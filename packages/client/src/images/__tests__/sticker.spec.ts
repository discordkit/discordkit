import * as v from "valibot";
import { mockUtils } from "#mocks";
import { sticker, stickerImageSchema } from "../sticker.js";

describe(`sticker`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        sticker(mockUtils.schema(stickerImageSchema))
      )
    ).not.toThrow();
  });
});
