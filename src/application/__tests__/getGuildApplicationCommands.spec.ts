import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildApplicationCommandsSchema,
  getGuildApplicationCommandsProcedure,
  getGuildApplicationCommandsQuery,
  getGuildApplicationCommandsSafe
} from "../getGuildApplicationCommands";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`getGuildApplicationCommands`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands`,
    applicationCommandSchema.array()
  );
  const config = generateMock(getGuildApplicationCommandsSchema);

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
