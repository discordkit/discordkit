import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteLobby,
  deleteLobbyProcedure,
  deleteLobbySafe,
  deleteLobbySchema
} from "../deleteLobby.js";

describe(`deleteLobby`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/lobbies/:lobby`,
    deleteLobbySchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteLobbySafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteLobbyProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteLobby);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
