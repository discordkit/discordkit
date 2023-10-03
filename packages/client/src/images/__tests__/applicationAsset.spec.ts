import { mockSchema } from "test-utils";
import { z } from "zod";
import {
  applicationAsset,
  applicationAssetSchema
} from "../applicationAsset.ts";

describe(`applicationAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(applicationAsset(mockSchema(applicationAssetSchema)))
    ).not.toThrow();
  });
});
