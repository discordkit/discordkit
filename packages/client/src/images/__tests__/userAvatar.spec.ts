import * as v from "valibot";
import { mockUtils } from "#mocks";
import { userAvatar, userAvatarSchema } from "../userAvatar.js";

describe(`userAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        userAvatar(mockUtils.schema(userAvatarSchema))
      )
    ).not.toThrow();
  });
});
