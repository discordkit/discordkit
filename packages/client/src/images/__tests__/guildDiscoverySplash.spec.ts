import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import {
  guildDiscoverySplash,
  guildDiscoverySplashSchema
} from "../guildDiscoverySplash.js";

describe(`guildDiscoverySplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        string([url()]),
        guildDiscoverySplash(mockSchema(guildDiscoverySplashSchema))
      )
    ).not.toThrow();
  });
});
