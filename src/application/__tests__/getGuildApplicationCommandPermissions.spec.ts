import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildApplicationCommandPermissionsSchema,
  getGuildApplicationCommandPermissionsProcedure,
  getGuildApplicationCommandPermissionsQuery,
  getGuildApplicationCommandPermissionsSafe
} from "../getGuildApplicationCommandPermissions";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions";

describe(`getGuildApplicationCommandPermissions`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands/permissions`,
    guildApplicationCommandPermissionsSchema.array()
  );
  const config = generateMock(getGuildApplicationCommandPermissionsSchema);

  it(`can be used standalone`, async () => {
    await expect(
      getGuildApplicationCommandPermissionsSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildApplicationCommandPermissionsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(
      getGuildApplicationCommandPermissionsQuery,
      config
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
