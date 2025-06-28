import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteGuildApplicationCommand,
  deleteGuildApplicationCommandProcedure,
  deleteGuildApplicationCommandSafe,
  deleteGuildApplicationCommandSchema
} from "../deleteGuildApplicationCommand.js";

describe(`deleteGuildApplicationCommand`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/applications/:application/guilds/:guild/commands/:command`,
    deleteGuildApplicationCommandSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      deleteGuildApplicationCommandSafe(config)
    ).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildApplicationCommandProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
