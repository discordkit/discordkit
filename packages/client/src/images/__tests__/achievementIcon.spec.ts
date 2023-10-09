import { mockSchema } from "test-utils";
import { parse, string, url } from "valibot";
import { achievementIcon, achievementIconSchema } from "../achievementIcon.js";

describe(`achievementIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), achievementIcon(mockSchema(achievementIconSchema)))
    ).not.toThrow();
  });
});
