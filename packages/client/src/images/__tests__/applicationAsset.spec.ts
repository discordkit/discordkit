import * as v from "valibot";
import { mockUtils } from "#mocks";
import {
  applicationAsset,
  applicationAssetSchema
} from "../applicationAsset.js";

describe(`applicationAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        applicationAsset(mockUtils.schema(applicationAssetSchema))
      )
    ).not.toThrow();
  });
});
