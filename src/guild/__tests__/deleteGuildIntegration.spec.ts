import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteGuildIntegration,
  deleteGuildIntegrationSchema
} from "../deleteGuildIntegration";

describe(`deleteGuildIntegration`, () => {
  mockRequest.delete(`/guilds/:guild/integrations/:integration`);
  const config = generateMock(deleteGuildIntegrationSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteGuildIntegration(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteGuildIntegration);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
