import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import { customEmoji, customEmojiSchema } from "../customEmoji.js";

describe(`customEmoji`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(pipe(string(), url()), customEmoji(mockSchema(customEmojiSchema)))
    ).not.toThrow();
  });
});
