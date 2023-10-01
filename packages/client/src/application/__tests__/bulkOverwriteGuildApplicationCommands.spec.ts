import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  bulkOverwriteGuildApplicationCommandsProcedure,
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema,
  bulkOverwriteGuildApplicationCommandsSafe
} from "../bulkOverwriteGuildApplicationCommands.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

describe(`bulkOverwriteGuildApplicationCommands`, () => {
  const expected = mockRequest.put(
    `/applications/:application/guilds/:guild/commands`,
    applicationCommandSchema.array().length(1)
  );
  const config = generateMock(bulkOverwriteGuildApplicationCommandsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      bulkOverwriteGuildApplicationCommandsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(bulkOverwriteGuildApplicationCommandsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkOverwriteGuildApplicationCommands);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});