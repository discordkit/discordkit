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
  getGuildApplicationCommandsQuery
} from "../getGuildApplicationCommands";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`getGuildApplicationCommands`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands`,
    applicationCommandSchema.array()
  );
  const input = generateMock(getGuildApplicationCommandsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildApplicationCommandsProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildApplicationCommandsQuery, input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
