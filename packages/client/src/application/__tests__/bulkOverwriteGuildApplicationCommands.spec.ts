import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runMutation, runProcedure } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import {
  bulkOverwriteGuildApplicationCommandsProcedure,
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema,
  bulkOverwriteGuildApplicationCommandsSafe
} from "../bulkOverwriteGuildApplicationCommands.js";

describe(`bulkOverwriteGuildApplicationCommands`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/applications/:application/guilds/:guild/commands`,
    bulkOverwriteGuildApplicationCommandsSchema,
    v.pipe(v.array(applicationCommandSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(
      bulkOverwriteGuildApplicationCommandsSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(bulkOverwriteGuildApplicationCommandsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkOverwriteGuildApplicationCommands);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
