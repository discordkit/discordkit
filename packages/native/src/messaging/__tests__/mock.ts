import {
  registerMockHandlers,
  type MockContext,
  type MockState
} from "../../__tests__/mockBackend.js";
// Messages embed an author/recipient user, so readMessage calls readUser —
// register the users mock handlers for that side effect.
import "../../users/__tests__/mock.js";
import type { ScriptedUser } from "../../users/__tests__/mock.js";

/**
 * Mock behavior for the messaging domain. Covers the message/channel/additional-
 * content snapshot getters, the send/edit/delete/get ops, DM summaries, and the
 * client-wide message event fan-out (delivered via {@link fireMessageEvent}).
 *
 * A scripted message's handle stashes `__message`; a channel `__channel`. Send
 * ops resolve with `nextMessageId`.
 */

export interface ScriptedChannel {
  id: bigint;
  name: string;
  type: number;
  recipientIds: bigint[];
}

export interface ScriptedAdditionalContent {
  type: number;
  count: number;
  title?: string;
}

export interface ScriptedMessage {
  id: bigint;
  content: string;
  rawContent: string;
  authorId: bigint;
  author?: ScriptedUser;
  channelId: bigint;
  channel?: ScriptedChannel;
  recipientId: bigint;
  lobbyId?: bigint;
  sentFromGame: boolean;
  sentTimestamp: bigint;
  editedTimestamp: bigint;
  metadata: Record<string, string>;
  moderationMetadata: Record<string, string>;
  additionalContent?: ScriptedAdditionalContent;
  disclosureType?: number;
}

interface MsgDomainState {
  messages: Map<bigint, ScriptedMessage>;
  channels: Map<bigint, ScriptedChannel>;
  history: ScriptedMessage[];
  summaries: { userId: bigint; lastMessageId: bigint }[];
  nextMessageId: bigint;
  actions: string[];
  events: Partial<Record<string, unknown>>;
  invoke?: (handle: unknown, ...args: unknown[]) => void;
}

const store = new WeakMap<MockState, MsgDomainState>();
const stateOf = (s: MockState): MsgDomainState => {
  let v = store.get(s);
  if (!v) {
    v = {
      messages: new Map(),
      channels: new Map(),
      history: [],
      summaries: [],
      nextMessageId: 0n,
      actions: [],
      events: {}
    };
    store.set(s, v);
  }
  return v;
};

/** Make a fully-populated scripted message, overridable per field. */
export const makeMessage = (
  overrides: Partial<ScriptedMessage> = {}
): ScriptedMessage => ({
  id: 7000n,
  content: `gg`,
  rawContent: `gg`,
  authorId: 11n,
  channelId: 900n,
  recipientId: 0n,
  sentFromGame: true,
  sentTimestamp: 1_700_000_000_000n,
  editedTimestamp: 0n,
  metadata: {},
  moderationMetadata: {},
  ...overrides
});

/** Register a scripted message so getMessage can return it. */
export const scriptMessage = (
  state: MockState,
  message: ScriptedMessage
): void => {
  stateOf(state).messages.set(message.id, message);
};

/** Register a scripted channel so getChannel can return it. */
export const scriptChannel = (
  state: MockState,
  channel: ScriptedChannel
): void => {
  stateOf(state).channels.set(channel.id, channel);
};

/** Set the message-id send ops resolve with. */
export const scriptNextMessageId = (state: MockState, id: bigint): void => {
  stateOf(state).nextMessageId = id;
};

/** Set the messages get-history ops resolve with. */
export const scriptHistory = (
  state: MockState,
  messages: ScriptedMessage[]
): void => {
  stateOf(state).history = messages;
};

/** Set the DM summaries getUserMessageSummaries resolves with. */
export const scriptSummaries = (
  state: MockState,
  summaries: { userId: bigint; lastMessageId: bigint }[]
): void => {
  stateOf(state).summaries = summaries;
};

/** Names of the messaging ops invoked on this mock, in order. */
export const messageActionsOf = (state: MockState): string[] =>
  stateOf(state).actions;

/** Deliver a client-wide message event to subscribers. */
export const fireMessageEvent = (
  state: MockState,
  event: `MessageCreated` | `MessageUpdated` | `MessageDeleted`,
  ...ids: bigint[]
): void => {
  const s = stateOf(state);
  s.invoke?.(s.events[event], ...ids);
};

const msgOf = (handle: unknown): ScriptedMessage | undefined =>
  (handle as { __message?: ScriptedMessage }).__message;
const chanOf = (handle: unknown): ScriptedChannel | undefined =>
  (handle as { __channel?: ScriptedChannel }).__channel;
const acOf = (handle: unknown): ScriptedAdditionalContent | undefined =>
  (handle as { __ac?: ScriptedAdditionalContent }).__ac;

const sendAck = (ctx: MockContext): undefined => {
  stateOf(ctx.state).actions.push(ctx.name);
  ctx.fireResultCallback(stateOf(ctx.state).nextMessageId);
  return undefined;
};
const ack = (ctx: MockContext): undefined => {
  stateOf(ctx.state).actions.push(ctx.name);
  ctx.fireResultCallback();
  return undefined;
};
const captureEvent =
  (event: string) =>
  (ctx: MockContext): undefined => {
    const s = stateOf(ctx.state);
    s.events[event] = ctx.args[1];
    s.invoke = ctx.invokeCallback;
    return undefined;
  };

registerMockHandlers({
  // --- send / edit / delete ---
  Discord_Client_SendUserMessage: sendAck,
  Discord_Client_SendUserMessageWithMetadata: sendAck,
  Discord_Client_SendLobbyMessage: sendAck,
  Discord_Client_SendLobbyMessageWithMetadata: sendAck,
  Discord_Client_EditUserMessage: ack,
  Discord_Client_DeleteUserMessage: ack,
  Discord_Client_OpenMessageInDiscord: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    // OpenMessageInDiscord has TWO callbacks (merge at args[2], result at args[5]);
    // fire the result one explicitly by symbol since it isn't args' first symbol.
    ctx.invokeCallback(ctx.args[5], null);
    return undefined;
  },
  Discord_Client_CanOpenMessageInDiscord: () => true,
  // --- sync reads ---
  Discord_Client_GetMessageHandle: (ctx) => {
    const msg = stateOf(ctx.state).messages.get(ctx.args[1] as bigint);
    if (!msg) return false;
    (ctx.args[2] as { __message?: ScriptedMessage }).__message = msg;
    return true;
  },
  Discord_Client_GetChannelHandle: (ctx) => {
    const chan = stateOf(ctx.state).channels.get(ctx.args[1] as bigint);
    if (!chan) return false;
    (ctx.args[2] as { __channel?: ScriptedChannel }).__channel = chan;
    return true;
  },
  // --- async history / summaries ---
  Discord_Client_GetUserMessagesWithLimit: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback({
      __span: stateOf(ctx.state).history.map((m) => ({ __message: m }))
    });
    return undefined;
  },
  Discord_Client_GetLobbyMessagesWithLimit: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback({
      __span: stateOf(ctx.state).history.map((m) => ({ __message: m }))
    });
    return undefined;
  },
  Discord_Client_GetUserMessageSummaries: (ctx) => {
    stateOf(ctx.state).actions.push(ctx.name);
    ctx.fireResultCallback({
      __span: stateOf(ctx.state).summaries.map((s) => ({ __summary: s }))
    });
    return undefined;
  },
  // --- event setters ---
  Discord_Client_SetMessageCreatedCallback: captureEvent(`MessageCreated`),
  Discord_Client_SetMessageUpdatedCallback: captureEvent(`MessageUpdated`),
  Discord_Client_SetMessageDeletedCallback: captureEvent(`MessageDeleted`),
  // --- UserMessageSummary getters ---
  Discord_UserMessageSummary_UserId: (ctx) =>
    (ctx.args[0] as { __summary?: { userId: bigint } }).__summary?.userId ?? 0n,
  Discord_UserMessageSummary_LastMessageId: (ctx) =>
    (ctx.args[0] as { __summary?: { lastMessageId: bigint } }).__summary
      ?.lastMessageId ?? 0n,
  // --- MessageHandle getters ---
  Discord_MessageHandle_Id: (ctx) => msgOf(ctx.args[0])?.id ?? 0n,
  Discord_MessageHandle_AuthorId: (ctx) => msgOf(ctx.args[0])?.authorId ?? 0n,
  Discord_MessageHandle_ChannelId: (ctx) => msgOf(ctx.args[0])?.channelId ?? 0n,
  Discord_MessageHandle_RecipientId: (ctx) =>
    msgOf(ctx.args[0])?.recipientId ?? 0n,
  Discord_MessageHandle_SentFromGame: (ctx) =>
    Boolean(msgOf(ctx.args[0])?.sentFromGame),
  Discord_MessageHandle_SentTimestamp: (ctx) =>
    msgOf(ctx.args[0])?.sentTimestamp ?? 0n,
  Discord_MessageHandle_EditedTimestamp: (ctx) =>
    msgOf(ctx.args[0])?.editedTimestamp ?? 0n,
  Discord_MessageHandle_Content: (ctx) => {
    ctx.writeString(ctx.args[1], msgOf(ctx.args[0])?.content ?? ``);
    return undefined;
  },
  Discord_MessageHandle_RawContent: (ctx) => {
    ctx.writeString(ctx.args[1], msgOf(ctx.args[0])?.rawContent ?? ``);
    return undefined;
  },
  Discord_MessageHandle_Metadata: (ctx) => {
    (ctx.args[1] as { __props?: Record<string, string> }).__props =
      msgOf(ctx.args[0])?.metadata ?? {};
    return undefined;
  },
  Discord_MessageHandle_ModerationMetadata: (ctx) => {
    (ctx.args[1] as { __props?: Record<string, string> }).__props =
      msgOf(ctx.args[0])?.moderationMetadata ?? {};
    return undefined;
  },
  Discord_MessageHandle_Author: (ctx) => {
    const user = msgOf(ctx.args[0])?.author;
    if (!user) return false;
    (ctx.args[1] as { __user?: ScriptedUser }).__user = user;
    return true;
  },
  Discord_MessageHandle_Channel: (ctx) => {
    const chan = msgOf(ctx.args[0])?.channel;
    if (!chan) return false;
    (ctx.args[1] as { __channel?: ScriptedChannel }).__channel = chan;
    return true;
  },
  Discord_MessageHandle_AdditionalContent: (ctx) => {
    const ac = msgOf(ctx.args[0])?.additionalContent;
    if (!ac) return false;
    (ctx.args[1] as { __ac?: ScriptedAdditionalContent }).__ac = ac;
    return true;
  },
  Discord_MessageHandle_DisclosureType: (ctx) => {
    const dt = msgOf(ctx.args[0])?.disclosureType;
    if (dt === undefined) return false;
    (ctx.args[1] as { __u64?: bigint }).__u64 = BigInt(dt);
    return true;
  },
  Discord_MessageHandle_Lobby: (ctx) => {
    const lobbyId = msgOf(ctx.args[0])?.lobbyId;
    if (lobbyId === undefined) return false;
    (ctx.args[1] as { __lobbyId?: bigint }).__lobbyId = lobbyId;
    return true;
  },
  // readMessage reads the lobby's Id() off the handle stashed above
  Discord_LobbyHandle_Id: (ctx) =>
    (ctx.args[0] as { __lobbyId?: bigint }).__lobbyId ?? 0n,
  // --- ChannelHandle getters ---
  Discord_ChannelHandle_Id: (ctx) => chanOf(ctx.args[0])?.id ?? 0n,
  Discord_ChannelHandle_Type: (ctx) => chanOf(ctx.args[0])?.type ?? 0,
  Discord_ChannelHandle_Name: (ctx) => {
    ctx.writeString(ctx.args[1], chanOf(ctx.args[0])?.name ?? ``);
    return undefined;
  },
  Discord_ChannelHandle_Recipients: (ctx) => {
    (ctx.args[1] as { __span?: bigint[] }).__span =
      chanOf(ctx.args[0])?.recipientIds ?? [];
    return undefined;
  },
  // --- AdditionalContent getters ---
  Discord_AdditionalContent_Type: (ctx) => acOf(ctx.args[0])?.type ?? 0,
  Discord_AdditionalContent_Count: (ctx) => acOf(ctx.args[0])?.count ?? 0,
  Discord_AdditionalContent_Title: (ctx) => {
    const title = acOf(ctx.args[0])?.title;
    if (title === undefined) return false;
    ctx.writeString(ctx.args[1], title);
    return true;
  }
});
