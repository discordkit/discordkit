import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { guildApplicationCommandPermissionsSchema } from "../../application-commands/types/GuildApplicationCommandPermissions.js";
import {
  getGuildApplicationCommandPermissionsSchema,
  getGuildApplicationCommandPermissions
} from "../getGuildApplicationCommandPermissions.js";

describe(`getGuildApplicationCommandPermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/guilds/:guild/commands/permissions`,
    getGuildApplicationCommandPermissionsSchema,
    v.pipe(v.array(guildApplicationCommandPermissionsSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildApplicationCommandPermissions,
        getGuildApplicationCommandPermissionsSchema,
        v.pipe(v.array(guildApplicationCommandPermissionsSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
