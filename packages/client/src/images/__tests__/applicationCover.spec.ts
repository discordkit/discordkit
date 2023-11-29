import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import {
  applicationCover,
  applicationCoverSchema
} from "../applicationCover.js";

describe(`applicationCover`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        string([url()]),
        applicationCover(mockSchema(applicationCoverSchema))
      )
    ).not.toThrow();
  });
});
