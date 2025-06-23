import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import {
  applicationAsset,
  applicationAssetSchema
} from "../applicationAsset.js";

describe(`applicationAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        applicationAsset(mockSchema(applicationAssetSchema))
      )
    ).not.toThrow();
  });
});
