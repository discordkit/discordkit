import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getLobbyProcedure,
  getLobbyQuery,
  getLobbySafe,
  getLobbySchema
} from "../getLobby.js";
import { lobbySchema } from "../types/Lobby.js";

describe(`getLobby`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/lobbies/:lobby`,
    getLobbySchema,
    lobbySchema
  );

  it(`can be used standalone`, async () => {
    await expect(getLobbySafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getLobbyProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getLobbyQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
