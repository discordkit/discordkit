import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import {
  bulkOverwriteGuildApplicationCommands,
  bulkOverwriteGuildApplicationCommandsSchema
} from "../bulkOverwriteGuildApplicationCommands.js";

describe(`bulkOverwriteGuildApplicationCommands`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/applications/:application/guilds/:guild/commands`,
    bulkOverwriteGuildApplicationCommandsSchema,
    v.pipe(v.array(applicationCommandSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        bulkOverwriteGuildApplicationCommands,
        bulkOverwriteGuildApplicationCommandsSchema,
        v.pipe(v.array(applicationCommandSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
