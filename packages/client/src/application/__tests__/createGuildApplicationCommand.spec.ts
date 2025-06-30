import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildApplicationCommandProcedure,
  createGuildApplicationCommand,
  createGuildApplicationCommandSchema,
  createGuildApplicationCommandSafe
} from "../createGuildApplicationCommand.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";

describe(`createGuildApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/applications/:application/guilds/:guild/commands`,
    createGuildApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildApplicationCommandSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildApplicationCommandProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
