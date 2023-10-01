import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  bulkOverwriteGlobalApplicationCommandsProcedure,
  bulkOverwriteGlobalApplicationCommands,
  bulkOverwriteGlobalApplicationCommandsSchema,
  bulkOverwriteGlobalApplicationCommandsSafe
} from "../bulkOverwriteGlobalApplicationCommands.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

describe(`bulkOverwriteGlobalApplicationCommands`, () => {
  const expected = mockRequest.put(
    `/applications/:application/commands`,
    applicationCommandSchema.array().length(1)
  );
  const config = mockSchema(bulkOverwriteGlobalApplicationCommandsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      bulkOverwriteGlobalApplicationCommandsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(bulkOverwriteGlobalApplicationCommandsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkOverwriteGlobalApplicationCommands);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
