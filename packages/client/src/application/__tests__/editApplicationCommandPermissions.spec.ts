import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  editApplicationCommandPermissions,
  editApplicationCommandPermissionsProcedure,
  editApplicationCommandPermissionsSafe,
  editApplicationCommandPermissionsSchema
} from "../editApplicationCommandPermissions.js";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions.js";

describe(`editApplicationCommandPermissions`, () => {
  const expected = mockRequest.patch(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    guildApplicationCommandPermissionsSchema
  );
  const config = mockSchema(editApplicationCommandPermissionsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      editApplicationCommandPermissionsSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editApplicationCommandPermissionsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editApplicationCommandPermissions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
