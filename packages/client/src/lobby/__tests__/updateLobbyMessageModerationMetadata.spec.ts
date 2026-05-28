import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  updateLobbyMessageModerationMetadata,
  updateLobbyMessageModerationMetadataSchema
} from "../updateLobbyMessageModerationMetadata.js";

describe(`updateLobbyMessageModerationMetadata`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/lobbies/:lobby/messages/:message/moderation-metadata`,
    updateLobbyMessageModerationMetadataSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        updateLobbyMessageModerationMetadata,
        updateLobbyMessageModerationMetadataSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
