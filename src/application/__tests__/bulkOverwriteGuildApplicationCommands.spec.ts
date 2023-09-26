import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  bulkOverwriteGuildApplicationCommandsProcedure,
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema
} from "../bulkOverwriteGuildApplicationCommands";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`bulkOverwriteGuildApplicationCommands`, () => {
  const expected = mockRequest.put(
    `/applications/:application/guilds/:guild/commands`,
    applicationCommandSchema.array()
  );
  const input = generateMock(bulkOverwriteGuildApplicationCommandsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(bulkOverwriteGuildApplicationCommandsProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkOverwriteGuildApplicationCommands);
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
