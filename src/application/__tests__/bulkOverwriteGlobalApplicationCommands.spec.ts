import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  bulkOverwriteGlobalApplicationCommandsProcedure,
  bulkOverwriteGlobalApplicationCommands,
  bulkOverwriteGlobalApplicationCommandsSchema,
  bulkOverwriteGlobalApplicationCommandsSafe
} from "../bulkOverwriteGlobalApplicationCommands";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`bulkOverwriteGlobalApplicationCommands`, () => {
  const expected = mockRequest.put(
    `/applications/:application/commands`,
    applicationCommandSchema.array()
  );
  const config = generateMock(bulkOverwriteGlobalApplicationCommandsSchema);

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
