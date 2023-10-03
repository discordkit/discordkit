import { mockSchema } from "test-utils";
import {
  userAvatarDecoration,
  userAvatarDecorationSchema
} from "../userAvatarDecoration.ts";
import { z } from "zod";

describe(`userAvatarDecoration`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(userAvatarDecoration(mockSchema(userAvatarDecorationSchema)))
    ).not.toThrow();
  });
});
