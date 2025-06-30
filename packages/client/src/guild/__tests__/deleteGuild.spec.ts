import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteGuild,
  deleteGuildProcedure,
  deleteGuildSafe,
  deleteGuildSchema
} from "../deleteGuild.js";

describe(`deleteGuild`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild`,
    deleteGuildSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteGuildSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
