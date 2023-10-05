import { mockSchema } from "test-utils";
import { z } from "zod";
import { guildSplash, guildSplashSchema } from "../guildSplash.js";

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
