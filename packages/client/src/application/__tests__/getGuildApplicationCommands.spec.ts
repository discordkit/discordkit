import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  getGuildApplicationCommandsSchema,
  getGuildApplicationCommandsProcedure,
  getGuildApplicationCommandsQuery,
  getGuildApplicationCommandsSafe
} from "../getGuildApplicationCommands.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`getGuildApplicationCommands`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands`,
    array(applicationCommandSchema, [length(1)])
  );
  const config = mockSchema(getGuildApplicationCommandsSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildApplicationCommandsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildApplicationCommandsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildApplicationCommandsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
