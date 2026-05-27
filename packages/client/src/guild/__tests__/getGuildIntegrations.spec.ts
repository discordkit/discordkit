import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { integrationSchema } from "../types/Integration.js";
import {
  getGuildIntegrationsSchema,
  getGuildIntegrations
} from "../getGuildIntegrations.js";

describe(`getGuildIntegrations`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/integrations`,
    getGuildIntegrationsSchema,
    v.pipe(v.array(integrationSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildIntegrations,
        getGuildIntegrationsSchema,
        v.pipe(v.array(integrationSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
