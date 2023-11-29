import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import { customEmoji, customEmojiSchema } from "../customEmoji.js";

describe(`customEmoji`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), customEmoji(mockSchema(customEmojiSchema)))
    ).not.toThrow();
  });
});
