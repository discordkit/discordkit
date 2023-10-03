import { mockSchema } from "test-utils";
import { applicationIcon, applicationIconSchema } from "../applicationIcon.ts";
import { z } from "zod";

describe(`applicationIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(applicationIcon(mockSchema(applicationIconSchema)))
    ).not.toThrow();
  });
});
