import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { userBanner, userBannerSchema } from "../userBanner.js";

describe(`userBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        userBanner(mockUtils.schema(userBannerSchema))
      )
    ).not.toThrow();
  });
});
