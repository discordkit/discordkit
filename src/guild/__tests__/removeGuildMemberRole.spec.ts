import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  removeGuildMemberRole,
  removeGuildMemberRoleSchema
} from "../removeGuildMemberRole";

describe(`removeGuildMemberRole`, () => {
  mockRequest.delete(`/guilds/:guild/members/:user/roles/:role`);
  const config = generateMock(removeGuildMemberRoleSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.removeGuildMemberRole(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(removeGuildMemberRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
