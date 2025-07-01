import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { integrationSchema } from "../types/Integration.js";
import {
  getGuildIntegrationsProcedure,
  getGuildIntegrationsQuery,
  getGuildIntegrationsSafe,
  getGuildIntegrationsSchema
} from "../getGuildIntegrations.js";

describe(`getGuildIntegrations`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/integrations`,
    getGuildIntegrationsSchema,
    v.pipe(v.array(integrationSchema), v.length(1))
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
