import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import {
  guildDiscoverySplash,
  guildDiscoverySplashSchema
} from "../guildDiscoverySplash.js";

describe(`guildDiscoverySplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        guildDiscoverySplash(mockSchema(guildDiscoverySplashSchema))
      )
    ).not.toThrow();
  });
});
