import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteGlobalApplicationCommand,
  deleteGlobalApplicationCommandProcedure,
  deleteGlobalApplicationCommandSafe,
  deleteGlobalApplicationCommandSchema
} from "../deleteGlobalApplicationCommand.js";

describe(`deleteGlobalApplicationCommand`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/applications/:application/commands/:command`,
    deleteGlobalApplicationCommandSchema
  );

  it(`can be used standalone`, async () => {
    await expect(
      deleteGlobalApplicationCommandSafe(config)
    ).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGlobalApplicationCommandProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGlobalApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
