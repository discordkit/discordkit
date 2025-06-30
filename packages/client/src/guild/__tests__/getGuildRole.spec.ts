import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildRoleProcedure,
  getGuildRoleQuery,
  getGuildRoleSafe,
  getGuildRoleSchema
} from "../getGuildRole.js";
import { roleSchema } from "../../permissions/Role.js";

describe(`getGuildRole`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/roles/:role`,
    getGuildRoleSchema,
    roleSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildRoleSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getGuildRoleProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildRoleQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
