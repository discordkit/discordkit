import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildRole,
  modifyGuildRoleProcedure,
  modifyGuildRoleSafe,
  modifyGuildRoleSchema
} from "../modifyGuildRole";
import { roleSchema } from "../types/Role";

describe(`modifyGuildRole`, () => {
  const expected = mockRequest.patch(`/guilds/:guild/roles/:role`, roleSchema);
  const config = generateMock(modifyGuildRoleSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildRoleSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildRoleProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
