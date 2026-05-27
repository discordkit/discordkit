import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  getGuildApplicationCommandSchema,
  getGuildApplicationCommand
} from "../getGuildApplicationCommand.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";

describe(`getGuildApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/guilds/:guild/commands/:command`,
    getGuildApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildApplicationCommand,
        getGuildApplicationCommandSchema,
        applicationCommandSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
