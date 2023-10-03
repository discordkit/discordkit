import { mockSchema } from "test-utils";
import { userBanner, userBannerSchema } from "../userBanner.ts";
import { z } from "zod";

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
