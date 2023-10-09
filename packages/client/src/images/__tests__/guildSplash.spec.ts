import { mockSchema } from "test-utils";
import { parse, string, url } from "valibot";
import { guildSplash, guildSplashSchema } from "../guildSplash.js";

describe(`guildSplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), guildSplash(mockSchema(guildSplashSchema)))
    ).not.toThrow();
  });
});
