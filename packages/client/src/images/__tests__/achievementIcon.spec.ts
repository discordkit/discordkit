import { mockSchema } from "test-utils";
import { z } from "zod";
import { achievementIcon, achievementIconSchema } from "../achievementIcon.ts";

describe(`achievementIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(achievementIcon(mockSchema(achievementIconSchema)))
    ).not.toThrow();
  });
});
