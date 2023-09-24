import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  removeGuildBan,
  removeGuildBanProcedure,
  removeGuildBanSchema
} from "../removeGuildBan";

describe(`removeGuildBan`, () => {
  mockRequest.delete(`/guilds/:guild/bans/:user`);
  const config = generateMock(removeGuildBanSchema);

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
