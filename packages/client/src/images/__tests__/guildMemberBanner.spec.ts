import { mockSchema } from "#test-utils";
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
        guildMemberBanner(mockSchema(guildMemberBannerSchema))
      )
    ).not.toThrow();
  });
});
