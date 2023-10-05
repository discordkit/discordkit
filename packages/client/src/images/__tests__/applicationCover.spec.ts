import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  applicationCover,
  applicationCoverSchema
} from "../applicationCover.js";

describe(`applicationCover`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(applicationCover(mockSchema(applicationCoverSchema)))
    ).not.toThrow();
  });
});
