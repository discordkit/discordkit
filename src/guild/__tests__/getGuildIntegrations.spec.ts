import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildIntegrationsQuery,
  getGuildIntegrationsSchema
} from "../getGuildIntegrations";
import { integrationSchema } from "../types/Integration";

describe(`getGuildIntegrations`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/integrations`,
    integrationSchema.array()
  );
  const config = generateMock(getGuildIntegrationsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildIntegrations(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildIntegrationsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
