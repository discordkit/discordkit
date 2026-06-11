import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  editGlobalApplicationCommand,
  editGlobalApplicationCommandSchema
} from "../editGlobalApplicationCommand.js";
import { applicationCommandSchema } from "../../application-commands/types/ApplicationCommand.js";

describe(`editGlobalApplicationCommand`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/applications/:application/commands/:command`,
    editGlobalApplicationCommandSchema,
    applicationCommandSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editGlobalApplicationCommand,
        editGlobalApplicationCommandSchema,
        applicationCommandSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
