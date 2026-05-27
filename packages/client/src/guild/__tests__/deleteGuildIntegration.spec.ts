import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  deleteGuildIntegration,
  deleteGuildIntegrationSchema
} from "../deleteGuildIntegration.js";

describe(`deleteGuildIntegration`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/integrations/:integration`,
    deleteGuildIntegrationSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteGuildIntegration, deleteGuildIntegrationSchema)(config)
    ).resolves.not.toThrow();
  });
});
