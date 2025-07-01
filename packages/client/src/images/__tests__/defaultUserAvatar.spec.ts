import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  defaultUserAvatar,
  defaultUserAvatarSchema
} from "../defaultUserAvatar.js";

describe(`defaultUserAvatar`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        defaultUserAvatar(mockUtils.schema(defaultUserAvatarSchema))
      )
    ).not.toThrow();
  });
});
