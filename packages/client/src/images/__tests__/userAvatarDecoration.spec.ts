import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  userAvatarDecoration,
  userAvatarDecorationSchema
} from "../userAvatarDecoration.js";

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
