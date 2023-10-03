import { mockSchema } from "test-utils";
import {
  guildMemberBanner,
  guildMemberBannerSchema
} from "../guildMemberBanner.ts";
import { z } from "zod";

describe(`guildMemberBanner`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(guildMemberBanner(mockSchema(guildMemberBannerSchema)))
    ).not.toThrow();
  });
});
