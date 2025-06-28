import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  listSKUsProcedure,
  listSKUsQuery,
  listSKUsSafe,
  listSKUsSchema
} from "../listSKUs.js";
import { skuSchema } from "../types/SKU.js";

describe(`listSKUs`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/skus`,
    listSKUsSchema,
    pipe(array(skuSchema), length(1))
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
