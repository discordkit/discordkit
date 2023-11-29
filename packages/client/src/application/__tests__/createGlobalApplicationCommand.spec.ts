import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGlobalApplicationCommandProcedure,
  createGlobalApplicationCommand,
  createGlobalApplicationCommandSchema,
  createGlobalApplicationCommandSafe
} from "../createGlobalApplicationCommand.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`createGlobalApplicationCommand`, () => {
  const expected = mockRequest.post(
    `/applications/:application/commands`,
    applicationCommandSchema
  );
  const config = mockSchema(createGlobalApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(createGlobalApplicationCommandSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGlobalApplicationCommandProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGlobalApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
