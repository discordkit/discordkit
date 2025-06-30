import { mockUtils } from "#mocks";
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
        guildDiscoverySplash(mockUtils.schema(guildDiscoverySplashSchema))
      )
    ).not.toThrow();
  });
});
