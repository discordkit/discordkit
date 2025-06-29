import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { guildBanner, guildBannerSchema } from "../guildBanner.js";

describe(`guildBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        guildBanner(mockUtils.schema(guildBannerSchema))
      )
    ).not.toThrow();
  });
});
