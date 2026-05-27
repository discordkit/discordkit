import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getApplicationCommandPermissionsSchema,
  getApplicationCommandPermissions
} from "../getApplicationCommandPermissions.js";
import { guildApplicationCommandPermissionsSchema } from "../../application-commands/types/GuildApplicationCommandPermissions.js";

describe(`getApplicationCommandPermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    getApplicationCommandPermissionsSchema,
    guildApplicationCommandPermissionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getApplicationCommandPermissions,
        getApplicationCommandPermissionsSchema,
        guildApplicationCommandPermissionsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
