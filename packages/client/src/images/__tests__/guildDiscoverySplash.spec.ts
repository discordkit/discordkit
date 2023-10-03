import { mockSchema } from "test-utils";
import {
  guildDiscoverySplash,
  guildDiscoverySplashSchema
} from "../guildDiscoverySplash.ts";
import { z } from "zod";

describe(`guildDiscoverySplash`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(guildDiscoverySplash(mockSchema(guildDiscoverySplashSchema)))
    ).not.toThrow();
  });
});
