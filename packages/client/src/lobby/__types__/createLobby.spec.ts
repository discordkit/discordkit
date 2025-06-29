import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createLobby,
  createLobbyProcedure,
  createLobbySafe,
  createLobbySchema
} from "../createLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`createLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/lobbies`,
    createLobbySchema,
    lobbySchema
  );

  it(`can be used standalone`, async () => {
    await expect(createLobbySafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(createLobbyProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createLobby);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
