import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { leaveLobby, leaveLobbySchema } from "../leaveLobby.js";

describe(`leaveLobby`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/lobbies/:lobby/members/@me`,
    leaveLobbySchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(leaveLobby, leaveLobbySchema)(config)
    ).resolves.not.toThrow();
  });
});
