import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { modifyGuildRole, modifyGuildRoleSchema } from "../modifyGuildRole";
import { roleSchema } from "../types/Role";

describe(`modifyGuildRole`, () => {
  const expected = mockRequest.patch(`/guilds/:guild/roles/:role`, roleSchema);
  const config = generateMock(modifyGuildRoleSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuildRole(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
