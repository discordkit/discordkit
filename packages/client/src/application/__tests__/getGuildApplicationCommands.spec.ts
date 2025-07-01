import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import {
  getGuildApplicationCommandsSchema,
  getGuildApplicationCommandsProcedure,
  getGuildApplicationCommandsQuery,
  getGuildApplicationCommandsSafe
} from "../getGuildApplicationCommands.js";

describe(`getGuildApplicationCommands`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/guilds/:guild/commands`,
    getGuildApplicationCommandsSchema,
    v.pipe(v.array(applicationCommandSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildApplicationCommandsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildApplicationCommandsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildApplicationCommandsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
