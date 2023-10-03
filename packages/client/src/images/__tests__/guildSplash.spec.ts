import { mockSchema } from "test-utils";
import { guildSplash, guildSplashSchema } from "../guildSplash.ts";
import { z } from "zod";

describe(`guildSplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(guildSplash(mockSchema(guildSplashSchema)))
    ).not.toThrow();
  });
});
