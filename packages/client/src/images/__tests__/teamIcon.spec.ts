import { mockSchema } from "test-utils";
import { z } from "zod";
import { teamIcon, teamIconSchema } from "../teamIcon.js";

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
