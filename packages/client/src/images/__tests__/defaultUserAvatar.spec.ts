import { mockSchema } from "#test-utils";
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
        defaultUserAvatar(mockSchema(defaultUserAvatarSchema))
      )
    ).not.toThrow();
  });
});
