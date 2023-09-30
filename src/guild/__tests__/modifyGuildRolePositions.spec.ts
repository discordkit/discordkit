import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildRolePositions,
  modifyGuildRolePositionsProcedure,
  modifyGuildRolePositionsSafe,
  modifyGuildRolePositionsSchema
} from "../modifyGuildRolePositions";
import { roleSchema } from "../types/Role";

describe(`modifyGuildRolePositions`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/roles`,
    roleSchema.array()
  );
  const config = generateMock(modifyGuildRolePositionsSchema);

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
