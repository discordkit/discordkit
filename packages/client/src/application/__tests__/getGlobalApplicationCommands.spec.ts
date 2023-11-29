import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length } from "valibot";
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
    array(applicationCommandSchema, [length(1)])
  );
  const config = mockSchema(getGlobalApplicationCommandsSchema);

  it(`can be used standalone`, async () => {
    await expect(getGlobalApplicationCommandsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGlobalApplicationCommandsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGlobalApplicationCommandsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
