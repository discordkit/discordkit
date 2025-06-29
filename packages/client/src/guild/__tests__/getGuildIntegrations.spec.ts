import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getGuildIntegrationsProcedure,
  getGuildIntegrationsQuery,
  getGuildIntegrationsSafe,
  getGuildIntegrationsSchema
} from "../getGuildIntegrations.js";
import { integrationSchema } from "../types/Integration.js";

describe(`getGuildIntegrations`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/integrations`,
    getGuildIntegrationsSchema,
    pipe(array(integrationSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildIntegrationsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildIntegrationsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildIntegrationsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
