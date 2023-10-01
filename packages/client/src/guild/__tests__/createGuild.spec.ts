import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuild,
  createGuildProcedure,
  createGuildSafe,
  createGuildSchema
} from "../createGuild.ts";
import { guildSchema } from "../types/Guild.ts";

describe(`createGuild`, () => {
  const expected = mockRequest.post(`/guilds`, guildSchema);
  const config = mockSchema(createGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
