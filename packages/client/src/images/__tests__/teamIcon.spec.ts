import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { teamIcon, teamIconSchema } from "../teamIcon.js";

describe(`teamIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(pipe(string(), url()), teamIcon(mockUtils.schema(teamIconSchema)))
    ).not.toThrow();
  });
});
