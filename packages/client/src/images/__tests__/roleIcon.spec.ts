import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import { roleIcon, roleIconSchema } from "../roleIcon.js";

describe(`roleIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), roleIcon(mockSchema(roleIconSchema)))
    ).not.toThrow();
  });
});
