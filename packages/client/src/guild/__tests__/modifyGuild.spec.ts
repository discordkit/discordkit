import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuild,
  modifyGuildProcedure,
  modifyGuildSafe,
  modifyGuildSchema
} from "../modifyGuild.js";
import { guildSchema } from "../types/Guild.js";

describe(`modifyGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild`,
    modifyGuildSchema,
    guildSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(modifyGuildProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
