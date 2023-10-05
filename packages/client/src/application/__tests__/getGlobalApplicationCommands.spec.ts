import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGlobalApplicationCommandsSchema,
  getGlobalApplicationCommandsProcedure,
  getGlobalApplicationCommandsQuery,
  getGlobalApplicationCommandsSafe
} from "../getGlobalApplicationCommands.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`getGlobalApplicationCommands`, () => {
  const expected = mockRequest.get(
    `/applications/:application/commands`,
    applicationCommandSchema.array().length(1)
  );
  const config = mockSchema(getGlobalApplicationCommandsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      getGlobalApplicationCommandsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGlobalApplicationCommandsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGlobalApplicationCommandsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
