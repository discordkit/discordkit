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
  getGuildRolesSafe,
  getGuildRolesSchema
} from "../getGuildRoles";
import { roleSchema } from "../types/Role";

describe(`getGuildRoles`, () => {
  const expected = mockRequest.get(`/guilds/:guild/roles`, roleSchema.array());
  const config = generateMock(getGuildRolesSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildRolesSafe(config)).resolves.toStrictEqual(expected);
  });

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
