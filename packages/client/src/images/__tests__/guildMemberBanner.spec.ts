import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  guildMemberBanner,
  guildMemberBannerSchema
} from "../guildMemberBanner.ts";

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
