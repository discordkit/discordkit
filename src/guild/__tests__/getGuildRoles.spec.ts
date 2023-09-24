import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildRolesProcedure,
  getGuildRolesQuery,
  getGuildRolesSchema
} from "../getGuildRoles";
import { roleSchema } from "../types/Role";

describe(`getGuildRoles`, () => {
  const expected = mockRequest.get(`/guilds/:guild/roles`, roleSchema.array());
  const config = generateMock(getGuildRolesSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildRolesProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildRolesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
