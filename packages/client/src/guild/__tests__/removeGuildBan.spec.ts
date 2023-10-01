import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  removeGuildBan,
  removeGuildBanProcedure,
  removeGuildBanSafe,
  removeGuildBanSchema
} from "../removeGuildBan.ts";

describe(`removeGuildBan`, () => {
  mockRequest.delete(`/guilds/:guild/bans/:user`);
  const config = generateMock(removeGuildBanSchema);

  it(`can be used standalone`, async () => {
    await expect(removeGuildBanSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(removeGuildBanProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(removeGuildBan);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
