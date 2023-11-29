import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getApplicationCommandPermissionsProcedure,
  getApplicationCommandPermissionsQuery,
  getApplicationCommandPermissionsSafe,
  getApplicationCommandPermissionsSchema
} from "../getApplicationCommandPermissions.js";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions.js";

describe(`getApplicationCommandPermissions`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    guildApplicationCommandPermissionsSchema
  );
  const config = mockSchema(getApplicationCommandPermissionsSchema);

  it(`can be used standalone`, async () => {
    await expect(getApplicationCommandPermissionsSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getApplicationCommandPermissionsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getApplicationCommandPermissionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
