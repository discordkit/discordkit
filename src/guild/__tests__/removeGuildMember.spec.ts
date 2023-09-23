import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  removeGuildMember,
  removeGuildMemberSchema
} from "../removeGuildMember";

describe(`removeGuildMember`, () => {
  mockRequest.delete(`/guilds/:guild/members/:user`);
  const config = generateMock(removeGuildMemberSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.removeGuildBan(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(removeGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
