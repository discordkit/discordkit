import { mockSchema } from "test-utils";
import { customEmoji, customEmojiSchema } from "../customEmoji.ts";
import { z } from "zod";

describe(`customEmoji`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(customEmoji(mockSchema(customEmojiSchema)))
    ).not.toThrow();
  });
});
