import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  createGuildApplicationCommandProcedure,
  createGuildApplicationCommand,
  createGuildApplicationCommandSchema,
  createGuildApplicationCommandSafe
} from "../createGuildApplicationCommand.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

describe(`createGuildApplicationCommand`, () => {
  const expected = mockRequest.post(
    `/applications/:application/guilds/:guild/commands`,
    applicationCommandSchema
  );
  const config = generateMock(createGuildApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(
      createGuildApplicationCommandSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildApplicationCommandProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
