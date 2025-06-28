import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { achievementIcon, achievementIconSchema } from "../achievementIcon.js";

describe(`achievementIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        achievementIcon(mockUtils.schema(achievementIconSchema))
      )
    ).not.toThrow();
  });
});
