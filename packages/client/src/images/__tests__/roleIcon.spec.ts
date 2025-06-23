import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import { roleIcon, roleIconSchema } from "../roleIcon.js";

describe(`roleIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(pipe(string(), url()), roleIcon(mockSchema(roleIconSchema)))
    ).not.toThrow();
  });
});
