import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getApplicationCommandPermissionsProcedure,
  getApplicationCommandPermissionsQuery,
  getApplicationCommandPermissionsSafe,
  getApplicationCommandPermissionsSchema
} from "../getApplicationCommandPermissions.ts";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions.ts";

const expected = mockRequest.get(
  `/applications/:application/guilds/:guild/commands/:command/permissions`,
  guildApplicationCommandPermissionsSchema
);
const config = mockSchema(getApplicationCommandPermissionsSchema);

describe(`getApplicationCommandPermissions`, () => {
  it(`can be used standalone`, async () => {
    await expect(
      getApplicationCommandPermissionsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getApplicationCommandPermissionsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getApplicationCommandPermissionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
