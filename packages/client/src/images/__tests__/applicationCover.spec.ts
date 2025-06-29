import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import {
  applicationCover,
  applicationCoverSchema
} from "../applicationCover.js";

describe(`applicationCover`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        applicationCover(mockUtils.schema(applicationCoverSchema))
      )
    ).not.toThrow();
  });
});
