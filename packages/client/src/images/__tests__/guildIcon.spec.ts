import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import { guildIcon, guildIconSchema } from "../guildIcon.js";

describe(`guildIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), guildIcon(mockSchema(guildIconSchema)))
    ).not.toThrow();
  });
});
