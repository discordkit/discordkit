import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteGuildIntegration,
  deleteGuildIntegrationProcedure,
  deleteGuildIntegrationSafe,
  deleteGuildIntegrationSchema
} from "../deleteGuildIntegration.ts";

describe(`deleteGuildIntegration`, () => {
  mockRequest.delete(`/guilds/:guild/integrations/:integration`);
  const config = generateMock(deleteGuildIntegrationSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteGuildIntegrationSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildIntegrationProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildIntegration);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
