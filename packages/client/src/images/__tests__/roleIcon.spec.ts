import { mockSchema } from "test-utils";
import { z } from "zod";
import { roleIcon, roleIconSchema } from "../roleIcon.ts";

describe(`roleIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(roleIcon(mockSchema(roleIconSchema)))
    ).not.toThrow();
  });
});
