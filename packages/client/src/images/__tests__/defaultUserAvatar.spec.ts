import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  defaultUserAvatar,
  defaultUserAvatarSchema
} from "../defaultUserAvatar.ts";

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
