import { mockSchema } from "test-utils";
import { z } from "zod";
import { guildBanner, guildBannerSchema } from "../guildBanner.ts";

describe(`guildBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(guildBanner(mockSchema(guildBannerSchema)))
    ).not.toThrow();
  });
});
