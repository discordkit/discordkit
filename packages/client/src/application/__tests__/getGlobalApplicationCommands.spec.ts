import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";
import {
  getGlobalApplicationCommandsSchema,
  getGlobalApplicationCommands
} from "../getGlobalApplicationCommands.js";

describe(`getGlobalApplicationCommands`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/commands`,
    getGlobalApplicationCommandsSchema,
    v.pipe(v.array(applicationCommandSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGlobalApplicationCommands,
        getGlobalApplicationCommandsSchema,
        v.pipe(v.array(applicationCommandSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
