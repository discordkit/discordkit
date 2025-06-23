import { mockSchema } from "#test-utils";
import { parse, pipe, string, url } from "valibot";
import { storePageAsset, storePageAssetSchema } from "../storePageAsset.js";

describe(`storePageAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(
        pipe(string(), url()),
        storePageAsset(mockSchema(storePageAssetSchema))
      )
    ).not.toThrow();
  });
});
