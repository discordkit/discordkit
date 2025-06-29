import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGlobalApplicationCommandSchema,
  getGlobalApplicationCommandProcedure,
  getGlobalApplicationCommandQuery,
  getGlobalApplicationCommandSafe
} from "../getGlobalApplicationCommand.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`getGlobalApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/commands/:command`,
    getGlobalApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGlobalApplicationCommandSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGlobalApplicationCommandProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGlobalApplicationCommandQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
