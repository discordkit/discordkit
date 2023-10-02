import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuildApplicationCommandProcedure,
  createGuildApplicationCommand,
  createGuildApplicationCommandSchema,
  createGuildApplicationCommandSafe
} from "../createGuildApplicationCommand.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

const expected = mockRequest.post(
  `/applications/:application/guilds/:guild/commands`,
  applicationCommandSchema
);
const config = mockSchema(createGuildApplicationCommandSchema);

describe(`createGuildApplicationCommand`, () => {
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
