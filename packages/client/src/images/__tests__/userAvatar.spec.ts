import { mockSchema } from "test-utils";
import { userAvatar, userAvatarSchema } from "../userAvatar.ts";
import { z } from "zod";

describe(`userAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(userAvatar(mockSchema(userAvatarSchema)))
    ).not.toThrow();
  });
});
