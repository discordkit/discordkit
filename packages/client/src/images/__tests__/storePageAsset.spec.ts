import { mockUtils } from "#mocks";
import { parse, pipe, string, url } from "valibot";
import { storePageAsset, storePageAssetSchema } from "../storePageAsset.js";

describe(`storePageAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        storePageAsset(mockUtils.schema(storePageAssetSchema))
      )
    ).not.toThrow();
  });
});
