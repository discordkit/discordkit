import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuild,
  createGuildProcedure,
  createGuildSafe,
  createGuildSchema
} from "../createGuild.js";
import { guildSchema } from "../types/Guild.js";

describe(`createGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds`,
    createGuildSchema,
    guildSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(createGuildProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
