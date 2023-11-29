import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import { applicationIcon, applicationIconSchema } from "../applicationIcon.js";

describe(`applicationIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), applicationIcon(mockSchema(applicationIconSchema)))
    ).not.toThrow();
  });
});
