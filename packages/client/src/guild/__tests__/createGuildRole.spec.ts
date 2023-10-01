import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  createGuildRole,
  createGuildRoleProcedure,
  createGuildRoleSafe,
  createGuildRoleSchema
} from "../createGuildRole.ts";
import { roleSchema } from "../types/Role.ts";

describe(`createGuildRole`, () => {
  const expected = mockRequest.post(`/guilds/:guild/roles`, roleSchema);
  const config = generateMock(createGuildRoleSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildRoleSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildRoleProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildRole);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
