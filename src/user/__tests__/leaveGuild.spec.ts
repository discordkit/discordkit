import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { leaveGuild, leaveGuildSchema } from "../leaveGuild";

describe(`leaveGuild`, () => {
  mockRequest.delete(`/users/@me/guilds/:guild`);
  const config = generateMock(leaveGuildSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.leaveGuild(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(leaveGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
