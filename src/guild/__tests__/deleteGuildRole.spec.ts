import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { deleteGuildRole, deleteGuildRoleSchema } from "../deleteGuildRole";

describe(`deleteGuildRole`, () => {
  mockRequest.delete(`/guilds/:guild/roles/:role`);
  const config = generateMock(deleteGuildRoleSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteGuildRole(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteGuildRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
