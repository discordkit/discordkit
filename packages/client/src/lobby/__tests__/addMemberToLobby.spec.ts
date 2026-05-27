import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  addMemberToLobby,
  addMemberToLobbyProcedure,
  addMemberToLobbySafe,
  addMemberToLobbySchema
} from "../addMemberToLobby.js";
import { lobbyMemberSchema } from "../types/LobbyMember.js";

describe(`addMemberToLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/lobbies/:lobby/members/:user`,
    addMemberToLobbySchema,
    lobbyMemberSchema
  );

  it(`can be used standalone`, async () => {
    await expect(addMemberToLobbySafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(addMemberToLobbyProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(addMemberToLobby);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
