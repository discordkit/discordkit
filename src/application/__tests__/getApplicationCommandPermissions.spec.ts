import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getApplicationCommandPermissionsProcedure,
  getApplicationCommandPermissionsQuery,
  getApplicationCommandPermissionsSafe,
  getApplicationCommandPermissionsSchema
} from "../getApplicationCommandPermissions";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions";

describe(`getApplicationCommandPermissions`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    guildApplicationCommandPermissionsSchema
  );
  const config = generateMock(getApplicationCommandPermissionsSchema);

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
