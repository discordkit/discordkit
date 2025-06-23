import { mockSchema } from "#test-utils";
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
        applicationCover(mockSchema(applicationCoverSchema))
      )
    ).not.toThrow();
  });
});
