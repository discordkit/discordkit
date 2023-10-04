import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuildBan,
  createGuildBanProcedure,
  createGuildBanSafe,
  createGuildBanSchema
} from "../createGuildBan.js";
import { banSchema } from "../types/Ban.js";

describe(`createGuildBan`, () => {
  mockRequest.put(`/guilds/:guild/bans/:user`, banSchema);
  const config = mockSchema(createGuildBanSchema);

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
