import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildIntegrationsProcedure,
  getGuildIntegrationsQuery,
  getGuildIntegrationsSafe,
  getGuildIntegrationsSchema
} from "../getGuildIntegrations";
import { integrationSchema } from "../types/Integration";

describe(`getGuildIntegrations`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/integrations`,
    integrationSchema.array()
  );
  const config = generateMock(getGuildIntegrationsSchema);

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
