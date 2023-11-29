import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import {
  guildMemberBanner,
  guildMemberBannerSchema
} from "../guildMemberBanner.js";

describe(`guildMemberBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        string([url()]),
        guildMemberBanner(mockSchema(guildMemberBannerSchema))
      )
    ).not.toThrow();
  });
});
