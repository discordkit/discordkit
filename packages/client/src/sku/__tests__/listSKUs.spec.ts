import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { skuSchema } from "../types/SKU.js";
import { listSKUsSchema, listSKUs } from "../listSKUs.js";

describe(`listSKUs`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/skus`,
    listSKUsSchema,
    v.pipe(v.array(skuSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listSKUs,
        listSKUsSchema,
        v.pipe(v.array(skuSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
