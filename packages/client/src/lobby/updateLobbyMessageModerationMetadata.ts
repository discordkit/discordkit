import * as v from "valibot";
import { put, type Fetcher, snowflake } from "@discordkit/core";

export const updateLobbyMessageModerationMetadataSchema = v.object({
  lobby: snowflake,
  message: snowflake,
  /**
   * Free-form key/value pairs describing the moderation decision.
   * Up to 5 keys; each key ≤ 1024 characters; each value ≤ 2000 characters.
   */
  body: v.pipe(
    v.record(
      v.pipe(v.string(), v.maxLength(1024)),
      v.pipe(v.string(), v.maxLength(2000))
    ),
    v.maxEntries(5)
  )
});

/**
 * ### [Update Lobby Message Moderation Metadata](https://discord.com/developers/docs/resources/lobby#update-lobby-message-moderation-metadata)
 *
 * **PUT** `/lobbies/:lobby/messages/:message/moderation-metadata`
 *
 * Sets the moderation metadata for a lobby message. The metadata is
 * app-scoped and delivered to active game clients via the Social SDK as
 * a realtime message update. See Integrate Moderation for the full
 * moderation flow.
 *
 * Uses `Bot` token for authorization.
 *
 * Returns `204 No Content` on success.
 */
export const updateLobbyMessageModerationMetadata: Fetcher<
  typeof updateLobbyMessageModerationMetadataSchema
> = async ({ lobby, message, body }) =>
  put(`/lobbies/${lobby}/messages/${message}/moderation-metadata`, body);
