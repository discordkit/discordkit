import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  removeMemberFromLobby,
  removeMemberFromLobbyProcedure,
  removeMemberFromLobbySafe,
  removeMemberFromLobbySchema
} from "../removeMemberFromLobby.js";

describe(`removeMemberFromLobby`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/lobbies/:lobby/members/:user`,
    removeMemberFromLobbySchema
  );

  it(`can be used standalone`, async () => {
    await expect(removeMemberFromLobbySafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(removeMemberFromLobbyProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(removeMemberFromLobby);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
