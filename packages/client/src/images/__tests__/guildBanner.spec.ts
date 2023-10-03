import { mockSchema } from "test-utils";
import { guildBanner, guildBannerSchema } from "../guildBanner.ts";
import { z } from "zod";

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
