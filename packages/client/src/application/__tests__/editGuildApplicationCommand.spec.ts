import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  editGuildApplicationCommand,
  editGuildApplicationCommandProcedure,
  editGuildApplicationCommandSafe,
  editGuildApplicationCommandSchema
} from "../editGuildApplicationCommand.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`editGuildApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/applications/:application/guilds/:guild/commands/:command`,
    editGuildApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`can be used standalone`, async () => {
    await expect(editGuildApplicationCommandSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editGuildApplicationCommandProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editGuildApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
