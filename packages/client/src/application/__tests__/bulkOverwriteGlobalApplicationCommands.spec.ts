import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runMutation, runProcedure } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import {
  bulkOverwriteGlobalApplicationCommandsProcedure,
  bulkOverwriteGlobalApplicationCommands,
  bulkOverwriteGlobalApplicationCommandsSchema,
  bulkOverwriteGlobalApplicationCommandsSafe
} from "../bulkOverwriteGlobalApplicationCommands.js";

describe(`bulkOverwriteGlobalApplicationCommands`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/applications/:application/commands`,
    bulkOverwriteGlobalApplicationCommandsSchema,
    v.pipe(v.array(applicationCommandSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(
      bulkOverwriteGlobalApplicationCommandsSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(bulkOverwriteGlobalApplicationCommandsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkOverwriteGlobalApplicationCommands);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
