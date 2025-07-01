import * as v from "valibot";
import { mockUtils } from "#mocks";
import { guildSplash, guildSplashSchema } from "../guildSplash.js";

describe(`guildSplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        guildSplash(mockUtils.schema(guildSplashSchema))
      )
    ).not.toThrow();
  });
});
