import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { roleSchema } from "../../permissions/Role.js";
import {
  modifyGuildRolePositions,
  modifyGuildRolePositionsProcedure,
  modifyGuildRolePositionsSafe,
  modifyGuildRolePositionsSchema
} from "../modifyGuildRolePositions.js";

describe(`modifyGuildRolePositions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/roles`,
    modifyGuildRolePositionsSchema,
    v.pipe(v.array(roleSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildRolePositionsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildRolePositionsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildRolePositions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
