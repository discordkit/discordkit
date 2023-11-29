import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  editGuildApplicationCommand,
  editGuildApplicationCommandProcedure,
  editGuildApplicationCommandSafe,
  editGuildApplicationCommandSchema
} from "../editGuildApplicationCommand.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`editGuildApplicationCommand`, () => {
  const expected = mockRequest.patch(
    `/applications/:application/guilds/:guild/commands/:command`,
    applicationCommandSchema
  );
  const config = mockSchema(editGuildApplicationCommandSchema);

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
