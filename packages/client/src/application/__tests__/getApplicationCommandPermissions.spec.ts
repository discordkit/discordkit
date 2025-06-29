import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getApplicationCommandPermissionsProcedure,
  getApplicationCommandPermissionsQuery,
  getApplicationCommandPermissionsSafe,
  getApplicationCommandPermissionsSchema
} from "../getApplicationCommandPermissions.js";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions.js";

describe(`getApplicationCommandPermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    getApplicationCommandPermissionsSchema,
    guildApplicationCommandPermissionsSchema
  );

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
