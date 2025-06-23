import { mockSchema } from "#test-utils";
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
        userAvatarDecoration(mockSchema(userAvatarDecorationSchema))
      )
    ).not.toThrow();
  });
});
