import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  editGuildApplicationCommand,
  editGuildApplicationCommandProcedure,
  editGuildApplicationCommandSafe,
  editGuildApplicationCommandSchema
} from "../editGuildApplicationCommand.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

const expected = mockRequest.patch(
  `/applications/:application/guilds/:guild/commands/:command`,
  applicationCommandSchema
);
const config = mockSchema(editGuildApplicationCommandSchema);

describe(`editGuildApplicationCommand`, () => {
  it(`can be used standalone`, async () => {
    await expect(
      editGuildApplicationCommandSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editGuildApplicationCommandProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editGuildApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
