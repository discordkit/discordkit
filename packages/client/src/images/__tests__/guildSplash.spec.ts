import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import { guildSplash, guildSplashSchema } from "../guildSplash.js";

describe(`guildSplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(pipe(string(), url()), guildSplash(mockSchema(guildSplashSchema)))
    ).not.toThrow();
  });
});
