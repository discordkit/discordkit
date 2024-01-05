import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import { guildBanner, guildBannerSchema } from "../guildBanner.js";

describe(`guildBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), guildBanner(mockSchema(guildBannerSchema)))
    ).not.toThrow();
  });
});
