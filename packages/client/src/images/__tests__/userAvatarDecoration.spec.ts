import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  userAvatarDecoration,
  userAvatarDecorationSchema
} from "../userAvatarDecoration.js";

describe(`userAvatarDecoration`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        userAvatarDecoration(mockUtils.schema(userAvatarDecorationSchema))
      )
    ).not.toThrow();
  });
});
