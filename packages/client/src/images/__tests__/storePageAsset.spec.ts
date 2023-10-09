import { mockSchema } from "test-utils";
import { parse, string, url } from "valibot";
import { storePageAsset, storePageAssetSchema } from "../storePageAsset.js";

describe(`storePageAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      parse(string([url()]), storePageAsset(mockSchema(storePageAssetSchema)))
    ).not.toThrow();
  });
});
