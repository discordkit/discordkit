import { mockSchema } from "test-utils";
import { z } from "zod";
import { customEmoji, customEmojiSchema } from "../customEmoji.ts";

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
