import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { deleteGuild, deleteGuildSchema } from "../deleteGuild";

describe(`deleteGuild`, () => {
  mockRequest.delete(`/guilds/:guild`);
  const config = generateMock(deleteGuildSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteGuild(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
