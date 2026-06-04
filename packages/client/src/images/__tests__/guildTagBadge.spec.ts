import * as v from "valibot";
import { mockUtils } from "#mocks";
import { guildTagBadge, guildTagBadgeSchema } from "../guildTagBadge.js";

describe(`guildTagBadge`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        guildTagBadge(mockUtils.schema(guildTagBadgeSchema))
      )
    ).not.toThrow();
  });
});
