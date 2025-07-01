import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { skuSchema } from "../types/SKU.js";
import {
  listSKUsProcedure,
  listSKUsQuery,
  listSKUsSafe,
  listSKUsSchema
} from "../listSKUs.js";

describe(`listSKUs`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/skus`,
    listSKUsSchema,
    v.pipe(v.array(skuSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(listSKUsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(listSKUsProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listSKUsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
