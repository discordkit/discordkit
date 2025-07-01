import * as v from "valibot";
import { mockUtils } from "#mocks";
import { guildIcon, guildIconSchema } from "../guildIcon.js";

describe(`guildIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        guildIcon(mockUtils.schema(guildIconSchema))
      )
    ).not.toThrow();
  });
});
