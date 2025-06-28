import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { customEmoji, customEmojiSchema } from "../customEmoji.js";

describe(`customEmoji`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        customEmoji(mockUtils.schema(customEmojiSchema))
      )
    ).not.toThrow();
  });
});
