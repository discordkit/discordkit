/**
 * Messaging — the public surface of `@discordkit/native/messaging`.
 *
 * Send messages to a user or a lobby (`sendUserMessage`, `sendLobbyMessage`,
 * both with optional metadata, resolving with the new message id), edit/delete
 * DMs (`editUserMessage`, `deleteUserMessage`), read messages
 * (`getMessage`, `getUserMessages`, `getLobbyMessages`, `getChannel`) as plain
 * {@link Message}/{@link Channel} snapshots, list DM conversations
 * (`getUserMessageSummaries`), and open a message in Discord
 * (`openMessageInDiscord`, gated by `canOpenMessageInDiscord`). Listen for
 * message events (`onMessageCreated`, `onMessageUpdated`, `onMessageDeleted`).
 *
 * A {@link Message} surfaces unrenderable content (`additionalContent`) so you
 * can show a "view on Discord" notice instead of trying to render it.
 *
 * Per the SDK: only send/edit/delete in response to an explicit user action.
 */
export {
  sendUserMessage,
  sendLobbyMessage,
  editUserMessage,
  deleteUserMessage,
  getMessage,
  getChannel,
  getUserMessages,
  getLobbyMessages,
  getUserMessageSummaries,
  canOpenMessageInDiscord,
  openMessageInDiscord
} from "./messages.js";
export type { MessageOptions } from "./messages.js";
export {
  onMessageCreated,
  onMessageUpdated,
  onMessageDeleted
} from "./messageEvents.js";
export type { MessageEventOptions } from "./messageEvents.js";
export { readMessage } from "./messageHandle.js";
export { readChannel } from "./channelHandle.js";
export { readAdditionalContent } from "./additionalContent.js";

export type {
  Message,
  Channel,
  ChannelType,
  AdditionalContent,
  AdditionalContentType,
  DisclosureType,
  UserMessageSummary,
  MessageMetadata
} from "./types.js";
