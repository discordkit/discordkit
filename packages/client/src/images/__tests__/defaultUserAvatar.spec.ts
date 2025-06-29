import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import {
  defaultUserAvatar,
  defaultUserAvatarSchema
} from "../defaultUserAvatar.js";

describe(`defaultUserAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        defaultUserAvatar(mockUtils.schema(defaultUserAvatarSchema))
      )
    ).not.toThrow();
  });
});
