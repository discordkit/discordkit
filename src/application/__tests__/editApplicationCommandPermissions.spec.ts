import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  editApplicationCommandPermissions,
  editApplicationCommandPermissionsProcedure,
  editApplicationCommandPermissionsSafe,
  editApplicationCommandPermissionsSchema
} from "../editApplicationCommandPermissions";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions";

describe(`editApplicationCommandPermissions`, () => {
  const expected = mockRequest.patch(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    guildApplicationCommandPermissionsSchema
  );
  const config = generateMock(editApplicationCommandPermissionsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      editApplicationCommandPermissionsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editApplicationCommandPermissionsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editApplicationCommandPermissions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
