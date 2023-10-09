import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  getGuildIntegrationsProcedure,
  getGuildIntegrationsQuery,
  getGuildIntegrationsSafe,
  getGuildIntegrationsSchema
} from "../getGuildIntegrations.js";
import { integrationSchema } from "../types/Integration.js";

describe(`getGuildIntegrations`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/integrations`,
    array(integrationSchema, [length(1)])
  );
  const config = mockSchema(getGuildIntegrationsSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildIntegrationsSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildIntegrationsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildIntegrationsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
