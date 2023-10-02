import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGlobalApplicationCommandProcedure,
  createGlobalApplicationCommand,
  createGlobalApplicationCommandSchema,
  createGlobalApplicationCommandSafe
} from "../createGlobalApplicationCommand.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

describe(`createGlobalApplicationCommand`, () => {
  const expected = mockRequest.post(
    `/applications/:application/commands`,
    applicationCommandSchema
  );
  const config = mockSchema(createGlobalApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(
      createGlobalApplicationCommandSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGlobalApplicationCommandProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGlobalApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
