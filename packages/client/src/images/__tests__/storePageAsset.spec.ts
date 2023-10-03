import { mockSchema } from "test-utils";
import { storePageAsset, storePageAssetSchema } from "../storePageAsset.ts";
import { z } from "zod";

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
