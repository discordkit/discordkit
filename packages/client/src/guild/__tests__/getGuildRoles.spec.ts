import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildRolesProcedure,
  getGuildRolesQuery,
  getGuildRolesSafe,
  getGuildRolesSchema
} from "../getGuildRoles.js";
import { roleSchema } from "../types/Role.js";

describe(`getGuildRoles`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/roles`,
    roleSchema.array().length(1)
  );
  const config = mockSchema(getGuildRolesSchema);

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
