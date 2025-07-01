import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { roleSchema } from "../../permissions/Role.js";
import {
  getGuildRolesProcedure,
  getGuildRolesQuery,
  getGuildRolesSafe,
  getGuildRolesSchema
} from "../getGuildRoles.js";

describe(`getGuildRoles`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/roles`,
    getGuildRolesSchema,
    v.pipe(v.array(roleSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildRolesSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getGuildRolesProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildRolesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
