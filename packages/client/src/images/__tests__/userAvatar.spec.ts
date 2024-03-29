import { mockSchema } from "test-utils";
import { z } from "zod";
import { userAvatar, userAvatarSchema } from "../userAvatar.js";

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
