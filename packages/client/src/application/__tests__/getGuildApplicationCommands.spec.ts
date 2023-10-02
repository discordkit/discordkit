import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildApplicationCommandsSchema,
  getGuildApplicationCommandsProcedure,
  getGuildApplicationCommandsQuery,
  getGuildApplicationCommandsSafe
} from "../getGuildApplicationCommands.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

describe(`getGuildApplicationCommands`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands`,
    applicationCommandSchema.array().length(1)
  );
  const config = mockSchema(getGuildApplicationCommandsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      getGuildApplicationCommandsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildApplicationCommandsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildApplicationCommandsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
