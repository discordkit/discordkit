import { mockSchema } from "test-utils";
import { z } from "zod";
import { storePageAsset, storePageAssetSchema } from "../storePageAsset.ts";

describe(`storePageAsset`, () => {
  it(`produces a valid URL`, () => {
    expect(() =>
      z
        .string()
        .url()
        .parse(storePageAsset(mockSchema(storePageAssetSchema)))
    ).not.toThrow();
  });
});
