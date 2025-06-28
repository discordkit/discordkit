import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGlobalApplicationCommandProcedure,
  createGlobalApplicationCommand,
  createGlobalApplicationCommandSchema,
  createGlobalApplicationCommandSafe
} from "../createGlobalApplicationCommand.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`createGlobalApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/applications/:application/commands`,
    createGlobalApplicationCommandSchema,
    applicationCommandSchema
  );

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
