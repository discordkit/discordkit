import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGuildBan,
  createGuildBanProcedure,
  createGuildBanSchema
} from "../createGuildBan";
import { banSchema } from "../types/Ban";

describe(`createGuildBan`, () => {
  const expected = mockRequest.put(`/guilds/:guild/bans/:user`, banSchema);
  const config = generateMock(createGuildBanSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildBanProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildBan);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
