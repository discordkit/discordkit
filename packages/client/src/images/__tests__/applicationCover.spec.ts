import { mockSchema } from "test-utils";
import {
  applicationCover,
  applicationCoverSchema
} from "../applicationCover.ts";
import { z } from "zod";

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
