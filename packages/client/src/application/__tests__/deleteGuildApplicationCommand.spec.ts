import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteGuildApplicationCommand,
  deleteGuildApplicationCommandProcedure,
  deleteGuildApplicationCommandSafe,
  deleteGuildApplicationCommandSchema
} from "../deleteGuildApplicationCommand.ts";

describe(`deleteGuildApplicationCommand`, () => {
  mockRequest.delete(
    `/applications/:application/guilds/:guild/commands/:command`
  );
  const config = generateMock(deleteGuildApplicationCommandSchema);

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
