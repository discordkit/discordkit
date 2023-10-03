import { mockSchema } from "test-utils";
import { teamIcon, teamIconSchema } from "../teamIcon.ts";
import { z } from "zod";

describe(`teamIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(teamIcon(mockSchema(teamIconSchema)))
    ).not.toThrow();
  });
});
