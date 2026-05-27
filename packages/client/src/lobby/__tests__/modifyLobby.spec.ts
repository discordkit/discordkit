import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyLobby,
  modifyLobbyProcedure,
  modifyLobbySafe,
  modifyLobbySchema
} from "../modifyLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`modifyLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/lobbies/:lobby`,
    modifyLobbySchema,
    lobbySchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyLobbySafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(modifyLobbyProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyLobby);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
