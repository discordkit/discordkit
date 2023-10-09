import { mockSchema } from "test-utils";
import { parse, string, url } from "valibot";
import { userAvatar, userAvatarSchema } from "../userAvatar.js";

describe(`userAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), userAvatar(mockSchema(userAvatarSchema)))
    ).not.toThrow();
  });
});
