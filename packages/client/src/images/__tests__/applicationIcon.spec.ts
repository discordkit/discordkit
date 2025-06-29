import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { applicationIcon, applicationIconSchema } from "../applicationIcon.js";

describe(`applicationIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        applicationIcon(mockUtils.schema(applicationIconSchema))
      )
    ).not.toThrow();
  });
});
