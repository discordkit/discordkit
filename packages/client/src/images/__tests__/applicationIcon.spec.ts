import { mockSchema } from "test-utils";
import { z } from "zod";
import { applicationIcon, applicationIconSchema } from "../applicationIcon.js";

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
