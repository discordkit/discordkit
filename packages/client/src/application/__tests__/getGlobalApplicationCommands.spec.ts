import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getGlobalApplicationCommandsSchema,
  getGlobalApplicationCommandsProcedure,
  getGlobalApplicationCommandsQuery,
  getGlobalApplicationCommandsSafe
} from "../getGlobalApplicationCommands.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

describe(`getGlobalApplicationCommands`, () => {
  const expected = mockRequest.get(
    `/applications/:application/commands`,
    applicationCommandSchema.array().length(1)
  );
  const config = generateMock(getGlobalApplicationCommandsSchema);

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
