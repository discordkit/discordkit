import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  bulkOverwriteGuildApplicationCommandsProcedure,
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema,
  bulkOverwriteGuildApplicationCommandsSafe
} from "../bulkOverwriteGuildApplicationCommands.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`bulkOverwriteGuildApplicationCommands`, () => {
  const expected = mockRequest.put(
    `/applications/:application/guilds/:guild/commands`,
    pipe(array(applicationCommandSchema), length(1))
  );
  const config = mockSchema(bulkOverwriteGuildApplicationCommandsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      bulkOverwriteGuildApplicationCommandsSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(bulkOverwriteGuildApplicationCommandsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkOverwriteGuildApplicationCommands);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
