import * as v from "valibot";
import { mockUtils } from "#mocks";
import { userBanner, userBannerSchema } from "../userBanner.js";

describe(`userBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        userBanner(mockUtils.schema(userBannerSchema))
      )
    ).not.toThrow();
  });
});
