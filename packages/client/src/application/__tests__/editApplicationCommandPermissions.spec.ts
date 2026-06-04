import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  editApplicationCommandPermissions,
  editApplicationCommandPermissionsSchema
} from "../editApplicationCommandPermissions.js";
import { guildApplicationCommandPermissionsSchema } from "../../application-commands/types/GuildApplicationCommandPermissions.js";

describe(`editApplicationCommandPermissions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/applications/:application/guilds/:guild/commands/:command/permissions`,
    editApplicationCommandPermissionsSchema,
    guildApplicationCommandPermissionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editApplicationCommandPermissions,
        editApplicationCommandPermissionsSchema,
        guildApplicationCommandPermissionsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
