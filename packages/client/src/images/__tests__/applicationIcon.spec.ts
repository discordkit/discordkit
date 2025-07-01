import * as v from "valibot";
import { mockUtils } from "#mocks";
import { applicationIcon, applicationIconSchema } from "../applicationIcon.js";

describe(`applicationIcon`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        applicationIcon(mockUtils.schema(applicationIconSchema))
      )
    ).not.toThrow();
  });
});
