import * as v from "valibot";
import { mockUtils } from "#mocks";
import { guildBanner, guildBannerSchema } from "../guildBanner.js";

describe(`guildBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        guildBanner(mockUtils.schema(guildBannerSchema))
      )
    ).not.toThrow();
  });
});
