import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyGuildRolePositions,
  modifyGuildRolePositionsProcedure,
  modifyGuildRolePositionsSafe,
  modifyGuildRolePositionsSchema
} from "../modifyGuildRolePositions.js";
import { roleSchema } from "../types/Role.js";

describe(`modifyGuildRolePositions`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/roles`,
    roleSchema.array().length(1)
  );
  const config = mockSchema(modifyGuildRolePositionsSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildRolePositionsSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildRolePositionsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildRolePositions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
