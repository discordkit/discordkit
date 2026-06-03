import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import {
  getGuildApplicationCommandsSchema,
  getGuildApplicationCommands
} from "../getGuildApplicationCommands.js";

describe(`getGuildApplicationCommands`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/guilds/:guild/commands`,
    getGuildApplicationCommandsSchema,
    v.pipe(v.array(applicationCommandSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildApplicationCommands,
        getGuildApplicationCommandsSchema,
        v.pipe(v.array(applicationCommandSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
