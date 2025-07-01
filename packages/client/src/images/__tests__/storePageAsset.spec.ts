import * as v from "valibot";
import { mockUtils } from "#mocks";
import { storePageAsset, storePageAssetSchema } from "../storePageAsset.js";

describe(`storePageAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      v.parse(
        v.pipe(v.string(), v.url()),
        storePageAsset(mockUtils.schema(storePageAssetSchema))
      )
    ).not.toThrow();
  });
});
