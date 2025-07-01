import * as v from "valibot";
import { mockUtils } from "#mocks";
import { achievementIcon, achievementIconSchema } from "../achievementIcon.js";

describe(`achievementIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        achievementIcon(mockUtils.schema(achievementIconSchema))
      )
    ).not.toThrow();
  });
});
