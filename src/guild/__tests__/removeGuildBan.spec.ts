import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { removeGuildBan, removeGuildBanSchema } from "../removeGuildBan";

describe(`removeGuildBan`, () => {
  mockRequest.delete(`/guilds/:guild/bans/:user`);
  const config = generateMock(removeGuildBanSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.removeGuildBan(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(removeGuildBan);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
