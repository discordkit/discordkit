import { mockUtils } from "#mocks";
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
        applicationAsset(mockUtils.schema(applicationAssetSchema))
      )
    ).not.toThrow();
  });
});
