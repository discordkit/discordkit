import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  guildDiscoverySplash,
  guildDiscoverySplashSchema
} from "../guildDiscoverySplash.js";

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
