import { mockSchema } from "test-utils";
import { achievementIcon, achievementIconSchema } from "../achievementIcon.ts";
import { z } from "zod";

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
