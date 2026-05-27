import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  createGuildApplicationCommand,
  createGuildApplicationCommandSchema
} from "../createGuildApplicationCommand.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";

describe(`createGuildApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/applications/:application/guilds/:guild/commands`,
    createGuildApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGuildApplicationCommand,
        createGuildApplicationCommandSchema,
        applicationCommandSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
