import { mockSchema } from "test-utils";
import { parse, string, url } from "valibot";
import { teamIcon, teamIconSchema } from "../teamIcon.js";

describe(`teamIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), teamIcon(mockSchema(teamIconSchema)))
    ).not.toThrow();
  });
});
