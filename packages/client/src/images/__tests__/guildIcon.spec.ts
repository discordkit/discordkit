import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { guildIcon, guildIconSchema } from "../guildIcon.js";

describe(`guildIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(pipe(string(), url()), guildIcon(mockUtils.schema(guildIconSchema)))
    ).not.toThrow();
  });
});
