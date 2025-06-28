import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import {
  guildMemberBanner,
  guildMemberBannerSchema
} from "../guildMemberBanner.js";

describe(`guildMemberBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        guildMemberBanner(mockUtils.schema(guildMemberBannerSchema))
      )
    ).not.toThrow();
  });
});
