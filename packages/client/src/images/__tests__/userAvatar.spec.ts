import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { userAvatar, userAvatarSchema } from "../userAvatar.js";

describe(`userAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        userAvatar(mockUtils.schema(userAvatarSchema))
      )
    ).not.toThrow();
  });
});
