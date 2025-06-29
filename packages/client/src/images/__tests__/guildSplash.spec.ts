import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { guildSplash, guildSplashSchema } from "../guildSplash.js";

describe(`guildSplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        guildSplash(mockUtils.schema(guildSplashSchema))
      )
    ).not.toThrow();
  });
});
