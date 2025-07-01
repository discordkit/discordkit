import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import {
  getGlobalApplicationCommandsSchema,
  getGlobalApplicationCommandsProcedure,
  getGlobalApplicationCommandsQuery,
  getGlobalApplicationCommandsSafe
} from "../getGlobalApplicationCommands.js";

describe(`getGlobalApplicationCommands`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/commands`,
    getGlobalApplicationCommandsSchema,
    v.pipe(v.array(applicationCommandSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getGlobalApplicationCommandsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGlobalApplicationCommandsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGlobalApplicationCommandsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
