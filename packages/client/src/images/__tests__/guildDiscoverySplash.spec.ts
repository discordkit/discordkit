import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  guildDiscoverySplash,
  guildDiscoverySplashSchema
} from "../guildDiscoverySplash.js";

describe(`guildDiscoverySplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        guildDiscoverySplash(mockUtils.schema(guildDiscoverySplashSchema))
      )
    ).not.toThrow();
  });
});
