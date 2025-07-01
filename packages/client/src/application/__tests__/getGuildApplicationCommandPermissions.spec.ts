import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { guildApplicationCommandPermissionsSchema } from "../../application-commands/types/GuildApplicationCommandPermissions.js";
import {
  getGuildApplicationCommandPermissionsSchema,
  getGuildApplicationCommandPermissionsProcedure,
  getGuildApplicationCommandPermissionsQuery,
  getGuildApplicationCommandPermissionsSafe
} from "../getGuildApplicationCommandPermissions.js";

describe(`getGuildApplicationCommandPermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/guilds/:guild/commands/permissions`,
    getGuildApplicationCommandPermissionsSchema,
    v.pipe(v.array(guildApplicationCommandPermissionsSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(
      getGuildApplicationCommandPermissionsSafe(config)
    ).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildApplicationCommandPermissionsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(
      getGuildApplicationCommandPermissionsQuery,
      config
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
