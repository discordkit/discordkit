import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteGuildIntegration,
  deleteGuildIntegrationProcedure,
  deleteGuildIntegrationSafe,
  deleteGuildIntegrationSchema
} from "../deleteGuildIntegration.js";

describe(`deleteGuildIntegration`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/integrations/:integration`,
    deleteGuildIntegrationSchema
  );

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
