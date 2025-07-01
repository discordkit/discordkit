import * as v from "valibot";
import { mockUtils } from "#mocks";
import { teamIcon, teamIconSchema } from "../teamIcon.js";

describe(`teamIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        teamIcon(mockUtils.schema(teamIconSchema))
      )
    ).not.toThrow();
  });
});
