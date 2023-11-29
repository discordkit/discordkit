import { mockSchema } from "#test-utils";
import { parse, string, url } from "valibot";
import {
  applicationAsset,
  applicationAssetSchema
} from "../applicationAsset.js";

describe(`applicationAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        string([url()]),
        applicationAsset(mockSchema(applicationAssetSchema))
      )
    ).not.toThrow();
  });
});
