import * as v from "valibot";
import { mockUtils } from "#mocks";
import { customEmoji, customEmojiSchema } from "../customEmoji.js";

describe(`customEmoji`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        customEmoji(mockUtils.schema(customEmojiSchema))
      )
    ).not.toThrow();
  });
});
