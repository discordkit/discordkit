import { mockSchema } from "test-utils";
import { guildIcon, guildIconSchema } from "../guildIcon.ts";
import { z } from "zod";

describe(`guildIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(guildIcon(mockSchema(guildIconSchema)))
    ).not.toThrow();
  });
});
