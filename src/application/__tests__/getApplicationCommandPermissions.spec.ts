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
  getApplicationCommandPermissionsSchema
} from "../getApplicationCommandPermissions";
import { guildApplicationCommandPermissionsSchema } from "../types/GuildApplicationCommandPermissions";

describe(`getApplicationCommandPermissions`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    guildApplicationCommandPermissionsSchema
  );
  const input = generateMock(getApplicationCommandPermissionsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getApplicationCommandPermissionsProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getApplicationCommandPermissionsQuery, input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
