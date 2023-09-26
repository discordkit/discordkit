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
  editApplicationCommandPermissionsSchema
} from "../editApplicationCommandPermissions";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions";

describe(`editApplicationCommandPermissions`, () => {
  const expected = mockRequest.patch(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    guildApplicationCommandPermissionsSchema
  );
  const input = generateMock(editApplicationCommandPermissionsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editApplicationCommandPermissionsProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editApplicationCommandPermissions);
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
