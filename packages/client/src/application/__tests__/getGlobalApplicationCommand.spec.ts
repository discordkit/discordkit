import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGlobalApplicationCommandSchema,
  getGlobalApplicationCommandProcedure,
  getGlobalApplicationCommandQuery,
  getGlobalApplicationCommandSafe
} from "../getGlobalApplicationCommand.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

describe(`getGlobalApplicationCommand`, () => {
  const expected = mockRequest.get(
    `/applications/:application/commands/:command`,
    applicationCommandSchema
  );
  const config = mockSchema(getGlobalApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(
      getGlobalApplicationCommandSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGlobalApplicationCommandProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGlobalApplicationCommandQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
