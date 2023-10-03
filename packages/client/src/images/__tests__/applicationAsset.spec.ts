import { mockSchema } from "test-utils";
import {
  applicationAsset,
  applicationAssetSchema
} from "../applicationAsset.ts";
import { z } from "zod";

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
