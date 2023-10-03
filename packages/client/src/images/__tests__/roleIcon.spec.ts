import { mockSchema } from "test-utils";
import { roleIcon, roleIconSchema } from "../roleIcon.ts";
import { z } from "zod";

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
