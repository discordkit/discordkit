import { useClient } from "../ambient.js";
import type { DiscordClient } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import type { ChannelId, LobbyId, MessageId, UserId } from "../snowflake.js";
import { readMessage } from "./messageHandle.js";
import { readChannel } from "./channelHandle.js";
import type { Channel, Message, UserMessageSummary } from "./types.js";

/**
 * The messaging domain's client-level operations: send (to a user or a lobby,
 * optionally with metadata), edit/delete (DM only), fetch a single message or
 * recent history, list DM conversation summaries, and open a message in Discord.
 *
 * Send ops resolve with the new message's **id** (`SendUserMessageCallback(result,
 * messageId)`) — fetch it back with {@link getMessage} if you need the full
 * snapshot. Edit/delete are keyed by `(recipientId, messageId)`: the C ABI only
 * exposes them for DMs, not lobby messages.
 *
 * Per the SDK: only send/edit/delete in response to an explicit user action —
 * never automatically.
 */
const bindings = defineBindings({
  sendUser: /* C */ `void Discord_Client_SendUserMessage(void *self, uint64_t recipientId, Discord_String content, void *cb, void *cbFree, void *cbUserData)`,
  sendUserWithMetadata: /* C */ `void Discord_Client_SendUserMessageWithMetadata(void *self, uint64_t recipientId, Discord_String content, Discord_Properties metadata, void *cb, void *cbFree, void *cbUserData)`,
  sendLobby: /* C */ `void Discord_Client_SendLobbyMessage(void *self, uint64_t lobbyId, Discord_String content, void *cb, void *cbFree, void *cbUserData)`,
  sendLobbyWithMetadata: /* C */ `void Discord_Client_SendLobbyMessageWithMetadata(void *self, uint64_t lobbyId, Discord_String content, Discord_Properties metadata, void *cb, void *cbFree, void *cbUserData)`,
  edit: /* C */ `void Discord_Client_EditUserMessage(void *self, uint64_t recipientId, uint64_t messageId, Discord_String content, void *cb, void *cbFree, void *cbUserData)`,
  deleteMsg: /* C */ `void Discord_Client_DeleteUserMessage(void *self, uint64_t recipientId, uint64_t messageId, void *cb, void *cbFree, void *cbUserData)`,
  getMessage: /* C */ `bool Discord_Client_GetMessageHandle(void *self, uint64_t messageId, Discord_MessageHandle *returnValue)`,
  getChannel: /* C */ `bool Discord_Client_GetChannelHandle(void *self, uint64_t channelId, Discord_ChannelHandle *returnValue)`,
  getUserMessages: /* C */ `void Discord_Client_GetUserMessagesWithLimit(void *self, uint64_t recipientId, int32_t limit, void *cb, void *cbFree, void *cbUserData)`,
  getLobbyMessages: /* C */ `void Discord_Client_GetLobbyMessagesWithLimit(void *self, uint64_t lobbyId, int32_t limit, void *cb, void *cbFree, void *cbUserData)`,
  getSummaries: /* C */ `void Discord_Client_GetUserMessageSummaries(void *self, void *cb, void *cbFree, void *cbUserData)`,
  canOpenInDiscord: /* C */ `bool Discord_Client_CanOpenMessageInDiscord(void *self, uint64_t messageId)`,
  openInDiscord: /* C */ `void Discord_Client_OpenMessageInDiscord(void *self, uint64_t messageId, void *mergeCb, void *mergeCbFree, void *mergeCbUserData, void *cb, void *cbFree, void *cbUserData)`,
  summaryUserId: /* C */ `uint64_t Discord_UserMessageSummary_UserId(void *self)`,
  summaryLastMessageId: /* C */ `uint64_t Discord_UserMessageSummary_LastMessageId(void *self)`,
  // result(, messageId) — send ops yield the new message id
  sendCb: {
    callback: /* C */ `void SendUserMessageCallback(void *result, uint64_t messageId, void *userData)`
  },
  // result-only acks
  ackCb: {
    callback: /* C */ `void AckCallback(void *result, void *userData)`
  },
  // result(, messages span)
  messagesCb: {
    callback: /* C */ `void GetMessagesCallback(void *result, Discord_MessageHandleSpan messages, void *userData)`
  },
  // result(, summaries span)
  summariesCb: {
    callback: /* C */ `void GetSummariesCallback(void *result, Discord_UserMessageSummarySpan summaries, void *userData)`
  }
});

/** Per-call options shared by messaging operations. */
export interface MessageOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
  /** Reject if the SDK hasn't acked within this many ms. Default 10000. */
  timeoutMs?: number;
}

/**
 * Send a direct message to a user, optionally with metadata. Resolves with the new message's id. Only call in response to an explicit user action.
 *
 * @example
 * ```ts
 * import { sendUserMessage, getMessage } from "@discordkit/native/messaging";
 *
 * const id = await sendUserMessage(recipientId, "gg!");
 * const sent = getMessage(id); // read it back as a Message snapshot
 * // with developer metadata (e.g. an in-game character name):
 * await sendUserMessage(recipientId, "hi", { metadata: { character: "Mage" } });
 * ```
 */
export const sendUserMessage = async (
  recipientId: UserId,
  content: string,
  options: MessageOptions & { metadata?: Record<string, string> } = {}
): Promise<MessageId> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult<MessageId>(
    client,
    b.sendCb,
    (ptr) =>
      options.metadata
        ? b.sendUserWithMetadata(
            client.handle,
            recipientId,
            client.lib.encodeString(content),
            client.lib.encodeProperties(options.metadata),
            ptr,
            null,
            null
          )
        : b.sendUser(
            client.handle,
            recipientId,
            client.lib.encodeString(content),
            ptr,
            null,
            null
          ),
    (messageId) => BigInt(messageId as bigint) as MessageId,
    { timeoutMs: options.timeoutMs, label: `send user message` }
  );
};

/** Send a message to a lobby, optionally with metadata. Resolves with the new message's id. */
export const sendLobbyMessage = async (
  lobbyId: LobbyId,
  content: string,
  options: MessageOptions & { metadata?: Record<string, string> } = {}
): Promise<MessageId> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult<MessageId>(
    client,
    b.sendCb,
    (ptr) =>
      options.metadata
        ? b.sendLobbyWithMetadata(
            client.handle,
            lobbyId,
            client.lib.encodeString(content),
            client.lib.encodeProperties(options.metadata),
            ptr,
            null,
            null
          )
        : b.sendLobby(
            client.handle,
            lobbyId,
            client.lib.encodeString(content),
            ptr,
            null,
            null
          ),
    (messageId) => BigInt(messageId as bigint) as MessageId,
    { timeoutMs: options.timeoutMs, label: `send lobby message` }
  );
};

/** Edit a DM message (keyed by the DM recipient + message id). */
export const editUserMessage = async (
  recipientId: UserId,
  messageId: MessageId,
  content: string,
  options: MessageOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  await awaitResult(
    client,
    b.ackCb,
    (ptr) =>
      b.edit(
        client.handle,
        recipientId,
        messageId,
        client.lib.encodeString(content),
        ptr,
        null,
        null
      ),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `edit user message` }
  );
};

/** Delete a DM message (keyed by the DM recipient + message id). */
export const deleteUserMessage = async (
  recipientId: UserId,
  messageId: MessageId,
  options: MessageOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  await awaitResult(
    client,
    b.ackCb,
    (ptr) =>
      b.deleteMsg(client.handle, recipientId, messageId, ptr, null, null),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `delete user message` }
  );
};

/** Get one message by id as a {@link Message} snapshot, or `undefined` if the SDK no longer has it. Synchronous. */
export const getMessage = (
  messageId: MessageId,
  options: { client?: DiscordClient } = {}
): Message | undefined => {
  const client = options.client ?? useClient();
  const out = client.lib.allocHandle();
  return bindings(client.lib).getMessage(client.handle, messageId, out)
    ? readMessage(client.lib, out)
    : undefined;
};

/** Get one channel by id as a {@link Channel} snapshot, or `undefined`. Synchronous. */
export const getChannel = (
  channelId: ChannelId,
  options: { client?: DiscordClient } = {}
): Channel | undefined => {
  const client = options.client ?? useClient();
  const out = client.lib.allocHandle();
  return bindings(client.lib).getChannel(client.handle, channelId, out)
    ? readChannel(client.lib, out)
    : undefined;
};

/** Read a span of message handles into {@link Message} snapshots. */
const readMessages = (client: DiscordClient, span: unknown): Message[] =>
  client.lib.readSpan(span).map((h) => readMessage(client.lib, h));

/** Get the most recent messages in a DM with a user (newest-first, up to `limit`). */
export const getUserMessages = async (
  recipientId: UserId,
  limit: number,
  options: MessageOptions = {}
): Promise<Message[]> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult<Message[]>(
    client,
    b.messagesCb,
    (ptr) =>
      b.getUserMessages(client.handle, recipientId, limit, ptr, null, null),
    (span) => readMessages(client, span),
    { timeoutMs: options.timeoutMs, label: `get user messages` }
  );
};

/** Get the most recent messages in a lobby (newest-first, up to `limit`). */
export const getLobbyMessages = async (
  lobbyId: LobbyId,
  limit: number,
  options: MessageOptions = {}
): Promise<Message[]> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult<Message[]>(
    client,
    b.messagesCb,
    (ptr) => b.getLobbyMessages(client.handle, lobbyId, limit, ptr, null, null),
    (span) => readMessages(client, span),
    { timeoutMs: options.timeoutMs, label: `get lobby messages` }
  );
};

/** List summaries of the current user's DM conversations. */
export const getUserMessageSummaries = async (
  options: MessageOptions = {}
): Promise<UserMessageSummary[]> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult<UserMessageSummary[]>(
    client,
    b.summariesCb,
    (ptr) => b.getSummaries(client.handle, ptr, null, null),
    (span) =>
      client.lib.readSpan(span).map((h) => ({
        userId: b.summaryUserId(h) as UserId,
        lastMessageId: b.summaryLastMessageId(h) as MessageId
      })),
    { timeoutMs: options.timeoutMs, label: `get user message summaries` }
  );
};

/** Whether a message can be opened in the Discord client (sync check). */
export const canOpenMessageInDiscord = (
  messageId: MessageId,
  options: { client?: DiscordClient } = {}
): boolean => {
  const client = options.client ?? useClient();
  return Boolean(
    bindings(client.lib).canOpenInDiscord(client.handle, messageId)
  );
};

/**
 * Open a message in the Discord client (e.g. to view unrenderable content). Resolves when the SDK acks. The SDK's provisional-user-merge callback is passed a no-op for now; the provisional-account merge flow will be handled when that slice lands.
 */
export const openMessageInDiscord = async (
  messageId: MessageId,
  options: MessageOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  await awaitResult(
    client,
    b.ackCb,
    (ptr) =>
      b.openInDiscord(
        client.handle,
        messageId,
        null,
        null,
        null,
        ptr,
        null,
        null
      ),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `open message in Discord` }
  );
};
