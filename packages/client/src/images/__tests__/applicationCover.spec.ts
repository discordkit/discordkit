import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  applicationCover,
  applicationCoverSchema
} from "../applicationCover.js";

describe(`applicationCover`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        applicationCover(mockUtils.schema(applicationCoverSchema))
      )
    ).not.toThrow();
  });
});
