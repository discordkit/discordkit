import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  editGuildApplicationCommand,
  editGuildApplicationCommandSchema
} from "../editGuildApplicationCommand.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";

describe(`editGuildApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/applications/:application/guilds/:guild/commands/:command`,
    editGuildApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editGuildApplicationCommand,
        editGuildApplicationCommandSchema,
        applicationCommandSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
