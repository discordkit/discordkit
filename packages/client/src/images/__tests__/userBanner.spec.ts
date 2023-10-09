import { mockSchema } from "test-utils";
import { parse, string, url } from "valibot";
import { userBanner, userBannerSchema } from "../userBanner.js";

describe(`userBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), userBanner(mockSchema(userBannerSchema)))
    ).not.toThrow();
  });
});
