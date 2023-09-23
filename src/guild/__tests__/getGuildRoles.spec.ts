import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getGuildRolesQuery, getGuildRolesSchema } from "../getGuildRoles";
import { roleSchema } from "../types/Role";

describe(`getGuildRoles`, () => {
  const expected = mockRequest.get(`/guilds/:guild/roles`, roleSchema.array());
  const config = generateMock(getGuildRolesSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildRoles(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildRolesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
