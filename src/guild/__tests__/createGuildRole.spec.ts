import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { createGuildRole, createGuildRoleSchema } from "../createGuildRole";
import { roleSchema } from "../types/Role";

describe(`createGuildRole`, () => {
  const expected = mockRequest.post(`/guilds/:guild/roles`, roleSchema);
  const config = generateMock(createGuildRoleSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuildRole(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuildRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
