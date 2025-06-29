import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildBan,
  createGuildBanProcedure,
  createGuildBanSafe,
  createGuildBanSchema
} from "../createGuildBan.js";

describe(`createGuildBan`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/guilds/:guild/bans/:user`,
    createGuildBanSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildBanSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildBanProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildBan);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
