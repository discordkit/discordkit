import { mockSchema } from "test-utils";
import {
  defaultUserAvatar,
  defaultUserAvatarSchema
} from "../defaultUserAvatar.ts";
import { z } from "zod";

describe(`defaultUserAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(defaultUserAvatar(mockSchema(defaultUserAvatarSchema)))
    ).not.toThrow();
  });
});
