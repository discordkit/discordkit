import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  bulkOverwriteGlobalApplicationCommandsProcedure,
  bulkOverwriteGlobalApplicationCommands,
  bulkOverwriteGlobalApplicationCommandsSchema,
  bulkOverwriteGlobalApplicationCommandsSafe
} from "../bulkOverwriteGlobalApplicationCommands.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`bulkOverwriteGlobalApplicationCommands`, () => {
  const expected = mockRequest.put(
    `/applications/:application/commands`,
    array(applicationCommandSchema, [length(1)])
  );
  const config = mockSchema(bulkOverwriteGlobalApplicationCommandsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      bulkOverwriteGlobalApplicationCommandsSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(bulkOverwriteGlobalApplicationCommandsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkOverwriteGlobalApplicationCommands);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
