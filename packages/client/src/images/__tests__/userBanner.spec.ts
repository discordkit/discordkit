import { mockSchema } from "test-utils";
import { z } from "zod";
import { userBanner, userBannerSchema } from "../userBanner.js";

describe(`userBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(userBanner(mockSchema(userBannerSchema)))
    ).not.toThrow();
  });
});
