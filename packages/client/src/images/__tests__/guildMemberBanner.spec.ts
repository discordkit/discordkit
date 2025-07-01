import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  guildMemberBanner,
  guildMemberBannerSchema
} from "../guildMemberBanner.js";

describe(`guildMemberBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        guildMemberBanner(mockUtils.schema(guildMemberBannerSchema))
      )
    ).not.toThrow();
  });
});
