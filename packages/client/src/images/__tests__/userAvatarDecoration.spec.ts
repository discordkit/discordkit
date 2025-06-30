import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import {
  userAvatarDecoration,
  userAvatarDecorationSchema
} from "../userAvatarDecoration.js";

describe(`userAvatarDecoration`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        userAvatarDecoration(mockUtils.schema(userAvatarDecorationSchema))
      )
    ).not.toThrow();
  });
});
