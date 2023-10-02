import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteGlobalApplicationCommand,
  deleteGlobalApplicationCommandProcedure,
  deleteGlobalApplicationCommandSafe,
  deleteGlobalApplicationCommandSchema
} from "../deleteGlobalApplicationCommand.ts";

mockRequest.delete(`/applications/:application/commands/:command`);
const config = mockSchema(deleteGlobalApplicationCommandSchema);

describe(`deleteGlobalApplicationCommand`, () => {
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
