import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { roleIcon, roleIconSchema } from "../roleIcon.js";

describe(`roleIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(pipe(string(), url()), roleIcon(mockUtils.schema(roleIconSchema)))
    ).not.toThrow();
  });
});
