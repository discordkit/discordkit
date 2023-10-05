import { mockSchema } from "test-utils";
import { z } from "zod";
import { guildIcon, guildIconSchema } from "../guildIcon.js";

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
